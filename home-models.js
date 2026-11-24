export const HOME_MODELS = Object.freeze([
  {
    "id": "model-01",
    "source": "./three/home-01-04-20261119/model-01-home.glb?v=d5fca8e79c57",
    "lightingModule": "./three/model01-lighting-study/home-window-lighting.js?v=373b890a7a77",
    "framingWidth": 6.666666666666667,
    "target": [
      0.0074,
      1.363,
      -0.0074
    ],
    "sourceOrder": false,
    "receiveTransparentShadow": true,
    "paneCount": 20
  },
  {
    "id": "model-img_5042",
    "source": "./three/home-refinement-20261118/model-img_5042/model-img_5042-refined.glb?v=a141587e8a13",
    "lightingModule": "./three/model-img_5042-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.00405,
      0.2419,
      -0.00405
    ],
    "sourceOrder": true,
    "receiveTransparentShadow": false,
    "paneCount": 23
  },
  {
    "id": "model-04",
    "source": "./three/home-roofs-03-06-20261119/model-04-roof.glb?v=3c27acdff1ef",
    "lightingModule": "./three/model04-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.01425,
      0.6416,
      -0.01425
    ],
    "sourceOrder": true,
    "receiveTransparentShadow": false,
    "paneCount": 32
  },
  {
    "id": "model-09",
    "source": "./three/home-01-04-20261119/model-09-home.glb?v=904857863b60",
    "initialAngle": 1.5707963267948966,
    "lightingModule": "./three/model09-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.02324,
      1.70914,
      -0.02324
    ],
    "sourceOrder": true,
    "receiveTransparentShadow": false,
    "paneCount": 20
  },
  {
    "id": "model-img_5043",
    "source": "./three/model-img_5043-roof-stair/model-img_5043-stair.glb?v=283ec17f63ac",
    "lightingModule": "./three/model-img_5043-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.004,
      0.964,
      -0.004
    ],
    "sourceOrder": true,
    "receiveTransparentShadow": false,
    "paneCount": 46,
    "initialAngle": 2.0943951023931953
  },
  {
    "id": "model-05",
    "source": "./three/home-roofs-03-06-20261119/model-05-roof.glb?v=41df4fb194ea",
    "lightingModule": "./three/model05-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.0,
      0.89,
      0.0
    ],
    "sourceOrder": true,
    "receiveTransparentShadow": false,
    "paneCount": 57
  },
  {
    "id": "model-06",
    "source": "./three/home-07-09-20261119/model-06-home.glb?v=603fc7694cb9",
    "lightingModule": "./three/model06-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.004,
      0.83,
      0.001
    ],
    "sourceOrder": true,
    "receiveTransparentShadow": false,
    "paneCount": 17
  },
  {
    "id": "model-11",
    "source": "./three/home-08-10-20261119/model-11-home.glb?v=ca2265b67e57",
    "litPaneBaseColor": "#555555",
    "litPaneEmissive": "#ff8420",
    "acceptedSource": "./three/model-11-view09-refine/model-11-refined.glb",
    "lightingModule": "./three/model11-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.0236,
      0.851,
      -0.0236
    ],
    "sourceOrder": false,
    "receiveTransparentShadow": false,
    "paneCount": 62
  },
  {
    "id": "model-08",
    "source": "./three/home-07-09-20261119/model-08-home.glb?v=252cd6838e9d",
    "lightingModule": "./three/model08-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.0,
      1.095,
      0.0
    ],
    "sourceOrder": false,
    "receiveTransparentShadow": false,
    "paneCount": 51
  },
  {
    "id": "model-10",
    "source": "./three/home-08-10-20261119/model-10-home.glb?v=931a95fe1201",
    "lightingModule": "./three/model10-lighting-study/window-lighting.js",
    "framingWidth": 7.111111111111111,
    "target": [
      0.0,
      1.37,
      0.0
    ],
    "sourceOrder": false,
    "receiveTransparentShadow": false,
    "paneCount": 33,
    "initialAngle": 2.9321531433504737
  }
].map(model => Object.freeze({...model, target: Object.freeze(model.target)})));
