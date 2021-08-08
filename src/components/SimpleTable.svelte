<script>
  export let data // array of rows, each row an array of cols
  export let id
  export let title
  let target = '#' + id
</script>

<div class='card'>
  <div class="card-body">
    <h5 class="card-title">{title}
     <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false"
      data-bs-target={target} aria-controls={id}>
        +/-
     </button>
    </h5>


    <div class="collapse show" id={id}>
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
</div>
