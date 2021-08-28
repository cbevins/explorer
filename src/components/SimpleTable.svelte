<script>
  /**
   * A simple, collapsible table
   */
  export let data // array of rows, where each row is an array of cols
  export let id
  export let title
  export let opened = false
  let target = '#' + id
  let label = opened ? '\u2303' : '\u2304'
  function clicked() {
    opened = !opened
    label = opened ? '\u2303' : '\u2304'
  }
</script>

<div class='card'>
  <div class="card-body">
    <h5 class="card-title">
      <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false"
        data-bs-target={target} aria-controls={id}
        on:click={clicked}>{title} {label}</button>
    </h5>

    <div class="collapse {opened ? 'show' : ''}" id={id}>
      <table class='table table-striped table-bordered table-sm'>
        <thead></thead>
        <tbody>
          {#each data as row}
          <tr>
            {#each row as col}
            <td>{col}</td>
            {/each}
          </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
