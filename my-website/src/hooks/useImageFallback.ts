import {useState} from "react";

export function useImageFallback(sources: readonly string[]) {
  const key = sources.join("\u0000");
  const [selection, setSelection] = useState({key, index: 0});
  const index = selection.key === key ? selection.index : 0;

  return {
    imageSrc: sources[index],
    onError: () => setSelection({key, index: index + 1}),
  };
}
