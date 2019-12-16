<template>
  <div>
    <section class="query-section">
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
      <el-select v-model="queryRoadName" placeholder="選擇國道路段">
        <el-option
          v-for="item in avaiableRoadNames"
          :key="item"
          :value="item"
        />
      </el-select>
      <el-radio-group v-model="queryDirection" style="margin-top:-4px">
        <el-radio-button label="N" />
        <el-radio-button label="S" />
      </el-radio-group>
    </section>

    <el-container style="height: 500px; border: 1px solid #eee">
      <el-aside width="350px" style="background-color: rgb(238, 241, 246)">
        <el-table
          :data="sectionsFiltered"
          @current-change="handleCurrentChange"
          highlight-current-row
          height="500"
          style="width: 100%"
        >
          <el-table-column
            prop="gentryId"
            label="ID"
            sortable
          />
          <el-table-column
            prop="sectionStart"
            label="路段起點"
            width="150"
            sortable
          />
          <el-table-column
            :formatter="(row, col) => { return row.locationMileRaw}"
            prop="locationMile"
            label="路段"
            sortable
          />
        </el-table>
      </el-aside>
      <el-main v-if="loaded">
        <line-chart
          :chart-data="chartData"
        />
        <el-row>
          <el-button @click="checkSectionInGoogleMap">
            GOOGLE MAP
          </el-button>
          <!-- <el-button type="primary">
            Primary
          </el-button>
          <el-button type="success">
            Success
          </el-button>
          <el-button type="info">
            Info
          </el-button>
          <el-button type="warning">
            Warning
          </el-button>
          <el-button type="danger">
            Danger
          </el-button> -->
        </el-row>
      </el-main>
    </el-container>
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
      avaiableRoadNames: [ '國道1號', '國道3號', '國道3甲', '國道5號', '國道1號汐止五股高架道路', '國道1號五股楊梅高架道路' ],
      queryDirection: 'N',
      queryRoadName: '國道1號',
      queryDate: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      queryHour: '00:00',
      currentSection: {},
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
        if (data.direction === this.queryDirection &&
          data.roadName === this.queryRoadName) {
          return true
        }
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
    checkSectionInGoogleMap () {
      const c = this.currentSection
      const url = `https://www.google.com/maps/search/${c.PositionLat},${c.PositionLon}`
      window.open(url)
    },
    handleCurrentChange (row) {
      this.loaded = false
      // prevent emptry row
      if (!row) { return }
      this.gtagTracking(row)
      this.currentSection = row
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
.query-section {
  margin: 1em 0;
}
.chart {
  min-height: 40vh;
}
.chart article {
  padding:2em;
}
</style>
