<script>
  /**
   * A simple, collapsible card
   */
  export let content
  export let id
  export let title
  export let opened = false
  let target = '#' + id
</script>

<div class='card mb-2'>
  <div class="card-body">
    <h5 class="card-title">{title}
     <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false"
      data-bs-target={target} aria-controls={id}>
        +/-
     </button>
    </h5>

    <div class="collapse {opened ? 'show' : ''}" id={id}>
      <p class="card-text">{content}</p>
    </div>
  </div>
</div>
