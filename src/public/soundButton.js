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
  }
});