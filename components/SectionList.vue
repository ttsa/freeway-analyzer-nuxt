<template>
  <div>
    <el-table
      :data="sectionsFiltered"
      @current-change="handleCurrentChange"
      highlight-current-row
      height="400"
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
      <article>
        車輛總計: {{ data.count }} 輛, 無效資料: {{ data.invalidCount }} 輛, 行駛方向: {{ data.direction }}, 85分位: {{ data._85th }} KM/h
      </article>
      <line-chart
        :chart-data="chartData"
      />
    </div>
  </div>
</template>

<script>
import request from 'axios'
import LineChart from './Line'

function getColorByLabel (label) {
  const colors = {
    '小客車': 'rgb(255, 99, 132)',
    '小貨車': 'rgb(255, 159, 64)',
    '大貨車': 'rgb(255, 205, 86)',
    '大客車': 'rgb(75, 192, 192)',
    '聯結車': 'rgb(54, 162, 235)'

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

      request('/sections/' + row.gentryId).then((res) => {
        this.data = res.data
        // debugger
        // const data = []
        // const xLabel = Object.keys(res.data.data)

        const chartData = {
          datasets: []
        }
        let maxSpeed = 0
        Object.keys(res.data.data).forEach((l, k) => {
          if (!chartData.datasets[k]) {
            const speeds = res.data.data[l].speeds
            Object.keys(speeds).forEach((k) => {
              const s = speeds[k]
              if (s > maxSpeed) { maxSpeed = s }
            })
          }
        })
        const xLabels = [...Array(maxSpeed + 1).keys()]
        Object.keys(res.data.data).forEach((l, k) => {
          const speeds = res.data.data[l].speeds
          const data = []
          xLabels.forEach((v) => {
            let s = speeds[v]
            if (typeof s === 'undefined') {
              s = 0
            }
            data.push(s)
          })

          chartData.datasets[k] = {
            fill: false,
            label: l,
            borderColor: getColorByLabel(l),
            data
          }
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
          'event_category': 'section',
          'event_label': this.sectionRange(row)
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
