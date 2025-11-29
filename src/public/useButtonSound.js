class SoundEffect {
  constructor(soundPath, volume = 0.5) {
    this.audio = new Audio(soundPath);
    this.audio.volume = volume;
    this.audio.preload = 'auto';
  }
  
  play() {
    const sound = this.audio.cloneNode();
    sound.volume = this.audio.volume;
    sound.play().catch(err => {
      console.log('Sound play failed:', err);
    });
  }
  
  setVolume(vol) {
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }
}

// Usage with class approach
const clickSound = new SoundEffect('path/to/click.mp3', 0.3);

document.querySelector('#checkout-btn').addEventListener('click', () => {
  clickSound.play();
  // Your other button logic here
});