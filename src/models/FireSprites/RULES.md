Definitions

- The *landscape* is a grid of cells

- A *cell* is an area of spatially constant burning conditions

- A *burning period* is a duration of temorally constant burning conditions

- A *fire sprite* is an independent actor that traverses the landscape according to the rules

Cell Rules

- Cells are either 'burnable' or 'unburnable'.  Sprites may not enter 'unburnable' cells.

- Each cell records the burning period when it is first entered by any fire sprite.

- Cells allow any fire sprites to enter during its initial burning period.

- Fire sprites that are within a cell at the end of its initial burning period are allowed to leave.

- Cells consume all fire sprites that attempt to enter it after its initial burning period.

Sprite Rules

- Fire sprites must travel in a *fixed direction* during a burning period.

- Fire sprite *velocity may change* as it enters adjacent cells.

- Fire sprites record their *travel distance* during each burning period.

- Fire sprites may traverse *burning* cells, but are consumed by *burned* cells.

- Fire sprites *spawn* multiple children at the end of each burning period.

- The number of children spawned is a function of the sprite's travel distance during the previous period.

- Newly spawned fire sprites are assigned a fixed direction to travel.

- Newly spawned fire sprites that land in a burned cell are consumed.

Collision Rules

- Fire sprites operate independently of each other.

- If a fire sprite encounters an *unburnable cell*, it immediately spawns children, who operate under the usual rules.
