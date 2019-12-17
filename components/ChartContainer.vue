<template>
  <div id="chart-wrapper" :class="isChartExpand ? 'expanded' : ''">
    <div v-if="loaded && !chartDataNotFound">
      <el-button
        @click="toggleChartStyle"
        type="primary"
        round
        size="mini"
        style="position: absolute;right: 5px;top: 5px;"
      >
        <span v-if="isChartExpand">縮小</span>
        <span v-else>長高</span>
      </el-button>
      <line-chart
        id="chart"
        :chart-data="chartData"
        :style="chartStyle"
      />
    </div>
    <div v-else class="message">
      <h2>
        <span v-if="chartDataNotFound">查無資料</span>
        <span v-if="!loaded">選擇路段</span>
      </h2>
    </div>
  </div>
</template>
<script>
import request from 'axios'
import LineChart from './LineChart'
function getColorByLabel (label) {
  const colors = {
    '小客車': 'rgb(255, 99, 132)',
    '小貨車': 'rgb(255, 159, 64)',
    '大貨車': 'rgb(255, 205, 86)',
    '大客車': 'rgb(75, 192, 192)',
    '聯結車': 'rgb(54, 162, 235)',
    '總計': 'rgb(153, 102, 255)'
    // purple: 'rgb(153, 102, 255)',
    // grey: 'rgb(201, 203, 207)'
  }

  return colors[label]
}
export default {
  components: {
    LineChart
  },
  props: {
    queryObject: {
      type: Object,
      default: () => {
        return {
          queryDate: '2019-12-14',
          queryHour: '15:00'
        }
      }
    }
  },
  data () {
    return {
      loaded: false,
      isChartExpand: false,
      chartDataNotFound: false,
      chartData: {
        datasets: []
      },
      chartStyle: {
        height: '400px'
      }
    }
  },
  computed () {

  },
  watch: {
    queryObject (newVal, oldVal) {
      if (
        Object.keys(newVal).length === 0 ||
        JSON.stringify(newVal) === JSON.stringify(oldVal)
      ) { return }
      this.loaded = false
      this.query(newVal)
    }
  },
  methods: {
    gtagTracking (row) {
      if (!window.gtag) { return }
      window.gtag('event', 'click', {
        'event_category': 'section',
        'event_label': row.name
      })
    },
    query (q) {
      const url = `/getSection?s=${q.startGentry}&e=${q.endGentry}&d=${q.queryDate}&h=${q.queryHour}`
      this.gtagTracking(q)
      request(url).then((res) => {
        // this.data = res.data
        const data = res.data
        this.loaded = true

        if (!data.maxSpeed) {
          this.chartDataNotFound = true
          return
        }

        this.chartDataNotFound = false

        const chartData = {
          datasets: []
        }
        const maxSpeed = data.maxSpeed
        const xLabels = [...Array(maxSpeed + 1).keys()]

        // const totalData = Array(maxSpeed + 1)
        const totalData = Array.from({ length: maxSpeed }, (v, k) => 0)
        // debugger
        let totalValidCount = 0
        let total85th = 0
        Object.keys(data.byVtype).forEach((l, k) => {
          const dataByVType = data.byVtype[l]
          const speeds = dataByVType.speeds
          const _data = []
          xLabels.forEach((v, i) => {
            let s = speeds[v]
            if (typeof s === 'undefined') {
              s = 0
            }
            totalData[i] = totalData[i] + s
            _data.push(s)
          })
          totalValidCount = totalValidCount + dataByVType.validCount
          total85th = total85th + dataByVType._85th
          chartData.datasets[k] = {
            fill: false,
            label: `${l} ${dataByVType.validCount} 輛, 85th ${dataByVType._85th} KM/h `,
            borderColor: getColorByLabel(l),
            data: _data
          }
        })
        total85th = total85th / (chartData.datasets.length)
        total85th = parseInt(total85th)
        // console.log('totalData', totalData)
        // count total
        chartData.datasets.unshift({
          fill: false,
          label: `總計 ${totalValidCount} 輛, 85th ${total85th} KM/h `,
          // label: [
          //   `總計 ${totalValidCount} 輛`,
          //   `85th ${total85th} KM/h`
          // ],
          borderColor: getColorByLabel('總計'),
          data: totalData
        })

        chartData.labels = xLabels
        this.chartData = Object.assign({}, {}, chartData)
      })
    },
    toggleChartStyle () {
      this.isChartExpand = !this.isChartExpand
      this.chartData = Object.assign({}, this.chartData)
      if (this.isChartExpand) {
        this.chartStyle = {
          height: '90vh'
        }
      } else {
        this.chartStyle = {
          height: '400px'
        }
      }
    }
  }
}
</script>
