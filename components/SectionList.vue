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
    <chart-container
      :query-object="queryObject"
    />
  </div>
</template>

<script>
import request from 'axios'
import moment from 'moment'
import ChartContainer from './ChartContainer'
export default {
  name: 'SectionList',
  components: {
    ChartContainer
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
      currentSection: false,
      sections: []
    }
  },
  computed: {
    sectionsFiltered () {
      return this.sections.filter((data) => {
        if (data.direction === this.queryDirection &&
          data.roadName === this.queryRoadName) {
          return true
        }
      })
    },
    queryDirectionAndRoadName () {
      return this.queryDirection + this.queryRoadName
    },
    queryDateAndHour () {
      return this.queryDate + this.queryHour
    },
    queryObject () {
      return {
        queryDate: this.queryDate,
        queryHour: this.queryHour,
        startGentry: this.currentSection.startGentry,
        endGentry: this.currentSection.endGentry
      }
    }
  },
  watch: {
    // custom computed variables
    queryDirectionAndRoadName () {
      this.currentSection = false
    },
    queryDateAndHour () {
      if (this.currentSection) {
        this.handleCurrentChange(this.currentSection)
      }
    }
  },
  created () {
    request('/sections').then((res) => {
      this.sections = res.data
    })
  },
  methods: {
    mapInit (e) {
      if (this.directionsService) { return }
      this.directionsService = new window.google.maps.DirectionsService()
      this.directionsRenderer = new window.google.maps.DirectionsRenderer()
      this.directionsRenderer.setMap(e.map)
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
      // prevent emptry row
      if (!row) { return }
      this.querySectionVisible = false
      this.gtagTracking(row)
      this.drawSection(row)
      this.currentSection = row
    },
    gtagTracking (row) {
      // console.log(row)
      // console.log(this.sectionRange(row))
      if (window.gtag) {
        window.gtag('event', 'click', {
          'event_category': 'section',
          'event_label': row.name
        })
      }
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
.message {
  height: 100%;
  display: flex;
  justify-content: center; /* align horizontal */
  align-items: center; /* align vertical */
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
