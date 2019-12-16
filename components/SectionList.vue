<template>
  <div>
    <el-date-picker
      v-model="queryDate"
      :picker-options="pickerOptions"
      type="date"
      value-format="yyyy-MM-dd"
      placeholder="選擇查詢日期"
    />
    <el-time-select
      v-model="queryHour"
      :picker-options="{
        start: '00:00',
        step: '01:00',
        end: '23:00'
      }"
      placeholder="選擇查詢時段"
    />
    <el-table
      :data="sectionsFiltered"
      @current-change="handleCurrentChange"
      highlight-current-row
      height="250"
      style="width: 100%"
    >
      <el-table-column
        prop="gentryId"
        label="ID"
      />
      <el-table-column
        prop="roadName"
        label="路名"
        sortable
      />
      <el-table-column
        prop="sectionStart"
        label="路段起點"
        width="400"
        sortable
      />
      <el-table-column
        prop="direction"
        label="方向"
        sortable
      />
      <!--
      <el-table-column
        prop="tripLength"
        label="距離"
        sortable
      />

      <el-table-column
        prop="_85th"
        label="85th"
        sortable
      /> -->
    </el-table>
    <div
      v-if="loaded"
      class="chart"
    >
      <line-chart
        :chart-data="chartData"
      />
    </div>
  </div>
</template>

<script>
import request from 'axios'
import moment from 'moment'
import LineChart from './Line'

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
  name: 'SectionList',
  components: {
    LineChart
  },
  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > moment().subtract(1, 'day')
        }
      },
      queryDate: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      queryHour: '00:00',
      search: '',
      sections: [],
      data: {},
      loaded: false,
      chartData: {
        // labels: [...Array(350).keys()],
        datasets: [
          // {
          //   label: '車量',
          //   backgroundColor: '#f87979',
          //   data: []
          // }
        ]
      }
    }
  },
  computed: {
    sectionsFiltered () {
      // TODO
      // implement filter function
      return this.sections.filter((data) => {
        if (!this.search) { return true }
        return true
      })
    }
  },
  created () {
    request('/sections').then((res) => {
      this.sections = res.data
    })
  },
  methods: {
    searchData (sections) {
      // console.log('sections', sections)
      return sections.filter((data) => {
        if (!this.search) {
          return data
        }
        // !this.search || data.name.toLowerCase().includes(this.search.toLowerCase())
      })
    },
    handleCurrentChange (row) {
      // this.loaded = false
      this.gtagTracking(row)
      const url = `/sections/${row.gentryId}?date=${this.queryDate}&hour=${this.queryHour}`
      request(url).then((res) => {
        this.data = res.data
        // debugger
        // const data = []
        // const xLabel = Object.keys(res.data.data)

        const chartData = {
          datasets: []
        }
        const maxSpeed = res.data.maxSpeed
        const xLabels = [...Array(maxSpeed).keys()]

        // const totalData = Array(maxSpeed + 1)
        const totalData = Array.from({ length: maxSpeed }, (v, k) => 0)
        // debugger
        let totalValidCount = 0
        let total85th = 0
        Object.keys(res.data.data).forEach((l, k) => {
          const dataByVType = res.data.data[l]
          const speeds = dataByVType.speeds
          const data = []
          xLabels.forEach((v, i) => {
            let s = speeds[v]
            if (typeof s === 'undefined') {
              s = 0
            }
            totalData[i] = totalData[i] + s
            data.push(s)
          })
          totalValidCount = totalValidCount + dataByVType.validCount
          total85th = total85th + dataByVType._85th
          chartData.datasets[k] = {
            fill: false,
            label: `${l}, ${dataByVType.validCount} 輛, 85th ${dataByVType._85th} KM/h `,
            borderColor: getColorByLabel(l),
            data
          }
        })
        total85th = total85th / (chartData.datasets.length)
        total85th = parseInt(total85th)
        // console.log('totalData', totalData)
        // count total
        chartData.datasets.unshift({
          fill: false,
          label: `總計 ${totalValidCount}輛, 85th ${total85th} KM/h `,
          borderColor: getColorByLabel('總計'),
          data: totalData
        })

        chartData.labels = xLabels
        this.chartData = Object.assign({}, {}, chartData)

        this.loaded = true
      })
    },
    sectionRange (row, col) {
      const s = row.startGentry
      const e = row.endGentry
      return `${s.sectionStart} ${s.locationMileRaw} ~ ${e.sectionEnd}  ${e.locationMileRaw}`
    },
    gtagTracking (row) {
      // console.log(row)
      // console.log(this.sectionRange(row))
      if (window.gtag) {
        window.gtag('event', 'click', {
          'event_category': 'section'
          // 'event_label': this.sectionRange(row)
        })
      }
    },
    getMiles (row, col) {
      const r = Math.abs(row.endGentry.locationMile - row.startGentry.locationMile).toFixed(2)

      if (isNaN(r)) { return -1 }
      return r
    }
  }
}
</script>

<style scoped>
.chart {
  min-height: 40vh;
}
.chart article {
  padding:2em;
}
</style>
