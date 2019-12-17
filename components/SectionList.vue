<template>
  <div>
    <GMap
      id="gmap"
      ref="gMap"
      @idle="mapInit"
      :options="{fullscreenControl: false, disableDefaultUI: true, center: {lat: 23.980919, lng: 121.051022}}"
      :zoom="8"
    />
    <section class="query-section">
      <el-date-picker
        v-model="queryDate"
        :picker-options="pickerOptions"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="選擇查詢日期"
        style="width: 135px;"
      />
      <el-time-select
        v-model="queryHour"
        :picker-options="{
          start: '00:00',
          step: '01:00',
          end: '23:00'
        }"
        style="width: 100px;"
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
      <el-popover
        id="section-selector"
        v-model="querySectionVisible"
        placement="right"
        width="400"
        trigger="click"
      >
        <el-table
          :data="sectionsFiltered"
          @current-change="handleCurrentChange"
          highlight-current-row
          height="400"
        >
          <el-table-column
            :formatter="(r) => { return r.name }"
            prop="startMile"
            label="路段"
            sortable
          />
          <el-table-column
            :formatter="(row, col) => { return row.mile}"
            prop="startMile"
            label="里程"
            sortable
          />
        </el-table>
        <el-button slot="reference">
          {{ currentSection | formatCurrentSection }}
        </el-button>
      </el-popover>
    </section>

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
      <div v-else>
        <h2 style="margin-top:25%;">
          <span v-if="loaded && chartDataNotFound">查無資料</span>
          <span v-else>選擇路段</span>
        </h2>
      </div>
      <!-- <el-row>
        <el-button @click="checkSectionInGoogleMap">
          GOOGLE MAP
        </el-button>
      </el-row> -->
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
  filters: {
    formatCurrentSection (c) {
      if (typeof c.name === 'undefined') {
        return '選擇路段'
      } else {
        return c.name + c.mile
      }
    }
  },
  data () {
    return {
      gmapUrl: '',
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > moment().subtract(1, 'day')
        }
      },
      avaiableRoadNames: [ '國道1號', '國道3號', '國道3甲', '國道5號', '國道1號汐止五股高架道路', '國道1號五股楊梅高架道路' ],
      queryDirection: 'N',
      queryRoadName: '國道1號',
      // queryDate: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      queryDate: '2019-12-14',
      queryHour: '15:00',
      querySectionVisible: false,
      currentSection: {},
      sections: [],
      data: {},
      loaded: false,
      isChartExpand: false,
      chartDataNotFound: true,
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
  mounted () {
    // this.directionsService = new window.google.maps.DirectionsService()
    // this.directionsRenderer = new window.google.maps.DirectionsRenderer()
    // this.directionsRenderer.setMap(this.$refs.gMap)
  },
  methods: {
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
    },
    mapInit (e) {
      if (this.directionsService) { return }
      this.directionsService = new window.google.maps.DirectionsService()
      this.directionsRenderer = new window.google.maps.DirectionsRenderer()
      this.directionsRenderer.setMap(e.map)
    },
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
      // const url = `https://www.google.com/maps/search/${c.PositionLat},${c.PositionLon}`
      const url = `https://www.google.com/maps/dir/${c.startPositon}/${c.endPositon}`
      // const url = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBOUrqs6YzoKU1PCEcdXWWXv7JKzXiHkK4&origin=${c.startPositon}&destination=${c.endPositon}`
      // this.gmapUrl = url
      window.open(url)
    },
    drawSection (row) {
      const request = {
        origin: row.startPositon,
        destination: row.endPositon,
        travelMode: 'DRIVING'
      }
      this.directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(result)
        }
      })
    },
    handleCurrentChange (row) {
      this.querySectionVisible = false
      this.loaded = false
      // prevent emptry row
      if (!row) { return }
      this.gtagTracking(row)
      this.currentSection = row
      this.drawSection(row)
      // this.gmapUrl = `https://www.google.com/maps/embed/v1/directions?key=${process.env.GMAP_KEY}&origin=${row.startPositon}&destination=${row.endPositon}`
      const url = `/sections/${row.startGentry}/${row.endGentry}/${this.queryDate} ${this.queryHour}`
      request(url).then((res) => {
        this.data = res.data
        this.loaded = true

        if (!res.data.maxSpeed) {
          this.chartDataNotFound = true
          return
        }

        this.chartDataNotFound = false
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
            label: `${l} ${dataByVType.validCount} 輛, 85th ${dataByVType._85th} KM/h `,
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

<style>
.el-table__row:hover {
  cursor: pointer;
}
#gmap {
  width: 100%;
  /* height: 100%; */
  position: fixed;
  top: 0px;
  left: 0;
  z-index: -1;
}
.GMap__Wrapper {
  height: calc(100vh - 400px) !important;
}
.query-section {
  margin: 0;
}

#chart-wrapper {
  background:#ffffff;
  /* width: calc(100vw - 400px); */
  width: 100%;
  height: 400px;
  position: fixed;
  bottom: 0px;
  right: 0;
}
#chart-wrapper.expanded{
  position: fixed;
  height: 90vh;
}
/* #section-list {
  position: fixed;
  left: 0px;
  bottom: 0px;
  width: 400px;
} */
#section-selector {
  padding:0;
}
.el-date-editor.el-input__inner{
  width: 135px;
}
</style>
