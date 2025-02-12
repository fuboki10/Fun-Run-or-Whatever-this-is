// Here, we import the things we need from other script files 
import Game from './common/game';
import DirectionalLightScene from './scenes/01-DirectionalLight';
import ChooseMaterialScene from './scenes/ChooseMaterial';
import TrackScene from './scenes/Track';
import PointLightScene from './scenes/02-PointLight';
import SpotLightScene from './scenes/03-SpotLight';
import MultipleLightsScene from './scenes/04-MultipleLights';
import MultiPassLightingsScene from './scenes/05-MultiPassLighting';
import TexturedMaterialsScene from './scenes/06-TexturedMaterials';
import ShadowMappingScene from './scenes/07-ShadowMapping';
import GameScene from './scenes/Game';
import {Howl,howler} from 'howler';
const sound = new Howl({
    src: ['sound.mp3'],
    autoplay: true,
    loop: true,
    volume: 0.5,
    onend: function() {
     console.log("Finished");
    }
  });
  sound.play();
// First thing we need is to get the canvas on which we draw our scenes
const canvas: HTMLCanvasElement = document.querySelector("#app");

// Then we create an instance of the game class and give it the canvas
const game = new Game(canvas);

// Here we list all our scenes and our initial scene
const scenes = {
    "Choose Material": ChooseMaterialScene,
    "Track": TrackScene,
    "Directional Light": DirectionalLightScene,
    "Point Light": PointLightScene,
    "Spot Light": SpotLightScene,
    "Multiple Lights": MultipleLightsScene,
    "Multi-Pass Lighting": MultiPassLightingsScene,
    "Textured Materials": TexturedMaterialsScene,
    "Shadow Mapping": ShadowMappingScene,
    "Game": GameScene
};
const initialScene = "Choose Material";

// Then we add those scenes to the game object and ask it to start the initial scene
game.addScenes(scenes);
game.startScene(initialScene);
// Here we setup a selector element to switch scenes from the webpage
const selector: HTMLSelectElement = document.querySelector("#scenes");
for(let name in scenes){
    let option = document.createElement("option");
    option.text = name;
    option.value = name;
    selector.add(option);
}
selector.value = initialScene;
selector.addEventListener("change", ()=>{
    game.startScene(selector.value);
});