const image = document.getElementById( 'productImg' );
const btn = document.getElementsByClassName( 'btn' );

btn[0].addEventListener('click', function(){
    image.src = '';
    for(bt of btn){
        bt.classList.remove('active');
    }
    this.classList.add('active');
});
btn[1].addEventListener('click', function(){
    image.src = '';
    for(bt of btn){
        bt.classList.remove('active');
    }
    this.classList.add('active');
});
btn[2].addEventListener('click', function(){
    image.src = '';
    for(bt of btn){
        bt.classList.remove('active');
    }
    this.classList.add('active');
});

import useButtonSound from "../hooks/useButtonSound";

export default function ProductPage() {
  useButtonSound(); // activate sound effect
  
}
