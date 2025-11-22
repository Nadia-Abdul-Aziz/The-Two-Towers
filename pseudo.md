basic mechanics
- floating plane
    - begins at position able to hit buildings
    - jump sends a certain amount up
    - ability to double jump

- Obstacles
    - Add all obstacles to 3 different arrays
        - Array 1: Low buildings
        - Array 2: Medium buildings
        - Array 3: Skyscrapers
    - Randomize obstacle spawn within array
    - Move each instance X amount to the left per frame
    - Kill object when off screen
    - After cycled  array x amount of times, change to new array
    - Use while loop 
    - If # =< X, then trigger boss object

let plane = {
    x = stable value
    y = sarting height
    jumpheight = value for jump
    jumpSpeed = px/frame

    


}