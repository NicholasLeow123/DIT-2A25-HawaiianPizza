import { useEffect } from "react";

export default function useButtonSound() {
  useEffect(() => {
    const audio = new Audio("/sounds/click.mp3");
    audio.volume = 0.7; // optional

    const handleClick = () => {
      audio.currentTime = 0; // restart if spam-clicked
      audio.play();
    };

    const button = document.getElementById("buyButton");
    if (button) button.addEventListener("click", handleClick);

    // Cleanup listener
    return () => {
      if (button) button.removeEventListener("click", handleClick);
    };
  }, []);
}
