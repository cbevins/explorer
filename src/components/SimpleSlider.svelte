<script>
  /**
   * A simple input slider
   */
  export let id
  export let label
  export let value
  export let min = 0
  export let max = 100
  export let step = 1
</script>

<div class='row'>
  <div class='col'>
    <label for={id} class="form-label">{label} {value}</label>
  </div>
  <div class='col'>
    <input type="range" class="form-range"
      bind:value={value} min={min} max={max} step={step} id={id}>
  </div>
</div>

