<script>
  export let data // array of rows, each row an array of cols
  export let title
</script>

<div class='card'>
  <div class="card-body">
  {#if title}
    <h5 class="card-title">{title}</h5>
    <hr/>
  {/if}
  <table class='table table-striped'>
    {#each data as row}
    <tr>
      {#each row as col}
        <td>{col}</td>
      {/each}
    </tr>
    {/each}
  </table>
  </div>
</div>
