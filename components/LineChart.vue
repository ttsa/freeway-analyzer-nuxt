<script>
import { Line } from 'vue-chartjs'
export default {
  extends: Line,
  props: {
    chartData: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: () => {
        return {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'bottom'
          },
          scales: {
            yAxes: [{
              ticks: {
                reverse: false,
                stepSize: 1
              }
            }]
          }
        }
      }
    }
  },
  watch: {
    chartData (newVal, oldVal) {
      this.renderChart(newVal, this.options)
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>

<style>
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
.message {
  height: 100%;
  display: flex;
  justify-content: center; /* align horizontal */
  align-items: center; /* align vertical */
}
</style>
