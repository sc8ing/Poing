### Qs for muller###

- this.[func] vs prototypes (startGame & move functions specifically)
- game core file as both module for server & use on client? (exporting)
  - load file for the module?






*todo*


- add way to notify/save score in core & reset ball when this happens, preferably with a slight delay between goals
- make default options in the game core to avoid having them specified in both server and client code and making sure they match
- change player.x/y to offsets along with a speed (+/- -> right/left)
- default player positions, fix update function in core
- function to calculate change in velocity depending on where it hit on the paddle
- putting keys in a record corresponding to what they mean (not just #s) in client code

