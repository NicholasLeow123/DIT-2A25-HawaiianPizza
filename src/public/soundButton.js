/*  Sound button module
    can be attached to any button with data-audio attribute
*/

const AudioPlayer = (() => {
  // Private variables
  const audioCache = new Map();

  /**
   * Play an audio file
   * @param {string} audioPath - Path to the audio file
   * @param {number} volume - Volume level (0.0 to 1.0), default 0.5
   * @returns {Promise} - Resolves when sound plays
   */
  const play = (audioPath, volume = 0.5) => {
    let audio;

    //use cached audio if available
    if (audioCache.has(audioPath)) {
        audio = audioCache.get(audioPath);
    } else {
        //create new audio element
        audio = new Audio(audioPath);
        audio.volume = volume;
        audio.preload = 'auto';
        audioCache.set(audioPath, audio);
    }

    //reset playback to zero
    audio.currentTime = 0;

    return audio.play().catch(err => {
        console.warn('Could not play audio:', err.message);
    });
  };

      /**
     * Initialize audio player on buttons with data-audio attribute
     * eg <button data-audio="./sounds/add_to_cart_bright_bell.mp3" data-audio-volume="0.7">Click me</button>
     */
    const init = () => {
      const audioButtons = document.querySelectorAll('[data-audio]');

      audioButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const audioPath = button.dataset.audioVolume;
          const volume = parseFloat(button.dataset.audioVolume) || 0.5;

          if (audioPath) {
            play(audioPath, volume);
          }
        });
      });

      console.log(`Audio player initialized on ${audioButtons.length} button(s)`);
    };

});