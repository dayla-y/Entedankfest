export default class Character extends Phaser.Physics.Arcade.Sprite{

    constructor (scene,x,y,texture) {

     super (scene,x,y,texture)

     this.scene=scene
     this.x=x
     this.y=y
     this.texture=texture
     this.scene.physics.add.existing(this) // le da fisica 
     this.scene.add.existing(this) // le da existencia
     this.velocidadPlayer=800;
     this.setMaxVelocity(800,800);
     
     

     // acomodar body
     this.body.setSize(60,60,true)
     this.body.setOffset(51,68)
     
     this.creaAnimaciones("parado",11,16,10,-1)
     this.creaAnimaciones("ataque",0,6,10,-1)
     this.creaAnimaciones("caminar",33,39,10,-1)
     this.creaAnimaciones("saltar",22,32,10,-1)        
     this.anims.play("caminar") // reproduce la animacion

     // teclas

     this.scene.cursors=this.scene.input.keyboard.createCursorKeys();
     
            
 }

 creaAnimaciones(NombreAnimacion,frameInicial,frameFinal,velocidadRep,repetir) {
     this.scene.anims.create({
         key: NombreAnimacion,
         frames: this.scene.anims.generateFrameNumbers(this.texture, { start:frameInicial, end:frameFinal}),
         frameRate:velocidadRep, // velocidad de animacion
         repeat: repetir // -1 loop  0 solo se ejecuta una vez 
     })

 }

 update() {
     // Movimiento horizontal
     if (this.scene.cursors.right.isDown) {
         this.setVelocityX(this.velocidadPlayer);
         this.flipX = false;
     } else if (this.scene.cursors.left.isDown) {
         this.setVelocityX(-this.velocidadPlayer);
         this.flipX = true;
     } else {
         this.setVelocityX(0);
     }

     // Movimiento vertical
     if (this.scene.cursors.up.isDown) {
         this.setVelocityY(-this.velocidadPlayer);
     } else if (this.scene.cursors.down.isDown) {
         this.setVelocityY(this.velocidadPlayer);
     } else {
         this.setVelocityY(0);
     }

     // Salto
     if (this.scene.cursors.space.isDown) {
         this.setVelocityY(-900); // Ajusta la fuerza del salto
     }
 }

}