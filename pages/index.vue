<template>
  <div id="app">
    <github-corner />
    <h1>高速公路自由車流分析器</h1>
    <p class="data-source">
      資料來源: 交通部高速公路局「<a href="http://tisvcloud.freeway.gov.tw" target="_blank">交通資料庫」</a>
    </p>
    <google-map
      :current-section="currentSection"
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
import ChartContainer from '@/components/ChartContainer'
import GoogleMap from '@/components/GoogleMap'
import GithubCorner from '@/components/GithubCorner'
export default {
  name: 'App',
  components: {
    ChartContainer,
    GoogleMap,
    GithubCorner
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
        queryRoadName: this.queryRoadName,
        direction: this.queryDirection,
        startGentry: this.currentSection.startGentry,
        endGentry: this.currentSection.endGentry
      }
    }
  },
  watch: {
    // custom computed variables
    queryDirectionAndRoadName () {
      this.currentSection = {}
    },
    queryDateAndHour () {
      // if (typeof this.currentSection.startGentry === 'undefined') { }
      // this.handleCurrentChange(this.currentSection)
    }
  },
  created () {
    request('/sections').then((res) => {
      this.sections = res.data
    })
  },
  methods: {
    handleCurrentChange (row) {
      // prevent emptry row
      if (!row) { return }
      this.querySectionVisible = false
      this.currentSection = row
    }
  }
}
</script>

<style>
h1 {
  background: rgba(255,255,255, 0.5);
  display: inline-block;
  padding: 0.3em 0.5em;
  border-radius: 20px;
  margin: 0.5em;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.data-source {
  width: 100%;
  font-size:9px;
  margin:0;
  padding:0;
  position: fixed;
  left:0;
  top:0;
  text-align: left;
}
.el-table__row:hover {
  cursor: pointer;
}

.query-section {
  margin: 0;
  z-index: 2;
  position: relative;
}

.el-date-editor.el-input__inner{
  width: 135px;
}
</style>
