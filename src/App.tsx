import './App.css'

import esriConfig from "@arcgis/core/config.js"
import { useEffect, useRef, useState } from 'react';
import WebScene  from "@arcgis/core/WebScene";
import Color  from "@arcgis/core/Color";
import SceneView  from "@arcgis/core/views/SceneView";


function App() {
  esriConfig.apiKey = import.meta.env.VITE_ARCGIS_AUTH_KEY;
  
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [webScene, setWebScene] = useState<WebScene | null>();
  const [view, setView] = useState<SceneView | null>();
  const [pointerActive, setPointerActive] = useState<boolean>(true);
  const [highlighted, setHighlighted] = useState<{ remove: () => void }[]>([]);
  useEffect(() => {
    if(!sceneRef.current) return;

   let bufferWebScene = new WebScene({
    portalItem: {
      // autocasts as new PortalItem()
      id: "475a7161ed194460b5b52654e29581a2"
    }
  });

  setWebScene(bufferWebScene);

  let bufferView = new SceneView({
    map: bufferWebScene,
    container: sceneRef.current,
    highlightOptions: {
      fillOpacity: 0.4,
      color: new Color([255, 0, 0]),
    }
  });

  setView(bufferView);
}, []);


useEffect(() => {
  if(!view) return;
  if(pointerActive) {
    const pointerMove = view.on("pointer-move", (e) => {
      // Åpne popup
      console.log("bevegelser registreres")
    })
    return () => pointerMove?.remove();
  }
  
}, [pointerActive, view, highlighted])




useEffect(() => {
  if(!view) return;

  const click = view.on("click", (e) => {
    view.hitTest(e).then(res => {
      if(highlighted) highlighted.forEach((e,i) => {
        if(i === highlighted.length) return;
        e.remove();
      });
      if(res.results.length > 0) {
        let hit = res.results[0];
        if(hit.type != "graphic") return;
        let layerView = view.allLayerViews.find(l => l.layer.id === hit.layer.id);
        if(layerView.layer.type != "feature") return;
        setHighlighted([...highlighted, layerView.highlight(hit.graphic)]);

        setPointerActive(false);
      } else {
        setPointerActive(true);
      }
    })
  })

  return () => click.remove();
}, [view, highlighted])



  return(
    <>
      <div className='vh-100' ref={sceneRef}></div>
      <button style={{position: 'fixed', top: "50px", right: "50px"}} onClick={() => setPointerActive(!pointerActive)}>toggle</button>
    </>
  )
}

export default App
