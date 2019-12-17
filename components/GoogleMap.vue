<template>
  <GMap
    id="gmap"
    ref="gMap"
    @idle="mapInit"
    :options="{fullscreenControl: false, disableDefaultUI: true, center: {lat: 23.980919, lng: 121.051022}}"
    :zoom="8"
  />
</template>

<script>
export default {
  props: {
    currentSection: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      directionsService: false,
      directionsRenderer: false
    }
  },
  watch: {
    currentSection (newVal, oldVal) {
      if (
        oldVal.startPosition === newVal.startPosition ||
        !newVal.startPosition) {
        return
      }
      this.drawSection(
        newVal.startPosition,
        newVal.endPosition
      )
    }
  },
  methods: {
    mapInit (e) {
      if (this.directionsService) { return }
      this.directionsService = new window.google.maps.DirectionsService()
      this.directionsRenderer = new window.google.maps.DirectionsRenderer()
      this.directionsRenderer.setMap(e.map)
    },
    drawSection (origin, destination) {
      const request = {
        origin,
        destination,
        travelMode: 'DRIVING'
      }
      this.directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(result)
        }
      })
    }
  }
}
</script>

<style>
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
</style>
