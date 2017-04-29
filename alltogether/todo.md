### Qs for muller###

- order matters for update? balls first or paddles


  ​

# currently on#


todo*


- make default options in the game core to avoid having them specified in both server and client code and making sure they match?
- default player positions
- putting keys in a record corresponding to what they mean (not just #s) in client code


## todo##

* bouncing is kind of screwed up
* width and height parameters for the game are all over the place, they should be as consolidated as possbile b/c otherwise the physics won't match up
* movement relays don't move accurately (override socket event is the only thing keeping stuff synced up)