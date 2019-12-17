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
