# Implémentation de la prop `resizeStep` dans react-grid-layout

Ce document détaille toutes les modifications nécessaires pour ajouter la prop `resizeStep` à la bibliothèque react-grid-layout, permettant de redimensionner les éléments par pas spécifiques (ex: 3, 6, 9, 12...).

## Vue d'ensemble

La prop `resizeStep` permet de contraindre le redimensionnement des éléments de la grille à des multiples d'une valeur donnée. Par exemple, avec `resizeStep={3}`, un élément ne peut être redimensionné qu'aux valeurs 3, 6, 9, 12, etc.

## Prérequis et dépendances

### **Installation des dépendances nécessaires :**

```bash
# Installer les dépendances de développement
npm install -D webpack-cli webpack-dev-server

# Ou si vous utilisez yarn
yarn add -D webpack-cli webpack-dev-server
```

### **Vérification de l'environnement :**

```bash
# Vérifier que Node.js est installé
node --version

# Vérifier que npm fonctionne
npm --version

# Installer les dépendances du projet
npm install
```

## Modifications à apporter

### 1. Ajout de la prop aux types et PropTypes

#### Fichier: `lib/ReactGridLayoutPropTypes.js`

**1.1. Ajouter `resizeStep` au type `Props`**

Localisez la définition du type `Props` (ligne ~48) et ajoutez la prop :

```javascript
export type Props = {|
  className: string,
  style: Object,
  width: number,
  autoSize: boolean,
  cols: number,
  draggableCancel: string,
  draggableHandle: string,
  verticalCompact: boolean,
  compactType: CompactType,
  layout: Layout,
  margin: [number, number],
  containerPadding: ?[number, number],
  rowHeight: number,
  maxRows: number,
  isBounded: boolean,
  isDraggable: boolean,
  isResizable: boolean,
  isDroppable: boolean,
  preventCollision: boolean,
  useCSSTransforms: boolean,
  transformScale: number,
  droppingItem: $Shape<LayoutItem>,
  resizeHandles: ResizeHandleAxis[],
  resizeHandle?: ResizeHandle,
  allowOverlap: boolean,
  resizeStep?: number,  // ← AJOUTER CETTE LIGNE

  // Callbacks
  onLayoutChange: Layout => void,
  // ... reste des callbacks
|};
```

**1.2. Ajouter la validation PropTypes**

Localisez la section des PropTypes (ligne ~184) et ajoutez :

```javascript
  // Resize handle options
  resizeHandles: resizeHandleAxesType,
  resizeHandle: resizeHandleType,

  // Resize step for snapping resize to specific increments
  resizeStep: PropTypes.number,  // ← AJOUTER CETTE LIGNE

  //
  // Callbacks
  //
```

### 2. Ajout de la prop aux defaultProps

#### Fichier: `lib/ReactGridLayout.jsx`

**2.1. Ajouter `resizeStep` aux defaultProps**

Localisez la section `static defaultProps` (ligne ~83) et ajoutez :

```javascript
  static defaultProps: DefaultProps = {
    autoSize: true,
    cols: 12,
    className: "",
    style: {},
    draggableHandle: "",
    draggableCancel: "",
    containerPadding: null,
    rowHeight: 150,
    maxRows: Infinity,
    layout: [],
    margin: [10, 10],
    isBounded: false,
    isDraggable: true,
    isResizable: true,
    allowOverlap: false,
    isDroppable: false,
    useCSSTransforms: true,
    transformScale: 1,
    verticalCompact: true,
    compactType: "vertical",
    preventCollision: false,
    droppingItem: {
      i: "__dropping-elem__",
      h: 1,
      w: 1
    },
    resizeHandles: ["se"],
    resizeStep: 1,  // ← AJOUTER CETTE LIGNE
    onLayoutChange: noop,
    // ... reste des callbacks
  };
```

**2.2. Extraire `resizeStep` des props dans `processGridItem`**

Localisez la méthode `processGridItem` (ligne ~602) et ajoutez `resizeStep` à la destructuration :

```javascript
    const {
      width,
      cols,
      margin,
      containerPadding,
      rowHeight,
      maxRows,
      isDraggable,
      isResizable,
      isBounded,
      useCSSTransforms,
      transformScale,
      draggableCancel,
      draggableHandle,
      resizeHandles,
      resizeHandle,
      resizeStep  // ← AJOUTER CETTE LIGNE
    } = this.props;
```

**2.3. Passer `resizeStep` au composant GridItem**

Dans la même méthode `processGridItem`, localisez le composant `<GridItem>` (ligne ~639) et ajoutez la prop :

```javascript
      <GridItem
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={containerPadding || margin}
        maxRows={maxRows}
        rowHeight={rowHeight}
        cancel={draggableCancel}
        handle={draggableHandle}
        onDragStop={this.onDragStop}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onResizeStart={this.onResizeStart}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        isDraggable={draggable}
        isResizable={resizable}
        isBounded={bounded}
        useCSSTransforms={useCSSTransforms && mounted}
        usePercentages={!mounted}
        transformScale={transformScale}
        w={l.w}
        h={l.h}
        x={l.x}
        y={l.y}
        i={l.i}
        minH={l.minH}
        minW={l.minW}
        maxH={l.maxH}
        maxW={l.maxW}
        static={l.static}
        droppingPosition={isDroppingItem ? droppingPosition : undefined}
        resizeHandles={resizeHandlesOptions}
        resizeHandle={resizeHandle}
        resizeStep={resizeStep}  // ← AJOUTER CETTE LIGNE
      >
        {child}
      </GridItem>
```

### 3. Modification du composant GridItem

#### Fichier: `lib/GridItem.jsx`

**3.1. Ajouter `resizeStep` au type Props**

Localisez la définition du type `Props` (ligne ~67) et ajoutez :

```javascript
type Props = {
  children: ReactElement<any>,
  cols: number,
  containerWidth: number,
  margin: [number, number],
  containerPadding: [number, number],
  rowHeight: number,
  maxRows: number,
  isDraggable: boolean,
  isResizable: boolean,
  isBounded: boolean,
  static?: boolean,
  useCSSTransforms?: boolean,
  usePercentages?: boolean,
  transformScale: number,
  droppingPosition?: DroppingPosition,

  className: string,
  style?: Object,
  // Draggability
  cancel: string,
  handle: string,

  x: number,
  y: number,
  w: number,
  h: number,

  minW: number,
  maxW: number,
  minH: number,
  maxH: number,
  i: string,

  resizeHandles?: ResizeHandleAxis[],
  resizeHandle?: ResizeHandle,
  resizeStep?: number,  // ← AJOUTER CETTE LIGNE

  onDrag?: GridItemCallback<GridDragEvent>,
  onDragStart?: GridItemCallback<GridDragEvent>,
  onDragStop?: GridItemCallback<GridDragEvent>,
  onResize?: GridItemCallback<GridResizeEvent>,
  onResizeStart?: GridItemCallback<GridResizeEvent>,
  onResizeStop?: GridItemCallback<GridResizeEvent>
};
```

**3.2. Ajouter `resizeStep` au type DefaultProps**

Localisez la définition du type `DefaultProps` (ligne ~114) et ajoutez :

```javascript
type DefaultProps = {
  className: string,
  cancel: string,
  handle: string,
  minH: number,
  minW: number,
  maxH: number,
  maxW: number,
  transformScale: number,
  resizeStep: number  // ← AJOUTER CETTE LIGNE
};
```

**3.3. Ajouter la validation PropTypes**

Localisez la section des PropTypes (ligne ~178) et ajoutez :

```javascript
    // Resize handle options
    resizeHandles: resizeHandleAxesType,
    resizeHandle: resizeHandleType,

    // Resize step for snapping resize to specific increments
    resizeStep: PropTypes.number,  // ← AJOUTER CETTE LIGNE

    // Functions
    onDragStop: PropTypes.func,
```

**3.4. Ajouter aux defaultProps**

Localisez la section `static defaultProps` (ligne ~217) et ajoutez :

```javascript
  static defaultProps: DefaultProps = {
    className: "",
    cancel: "",
    handle: "",
    minH: 1,
    minW: 1,
    maxH: Infinity,
    maxW: Infinity,
    transformScale: 1,
    resizeStep: 1  // ← AJOUTER CETTE LIGNE
  };
```

**3.4. Importer la fonction utilitaire**

Localisez les imports (ligne ~14) et ajoutez `applyResizeStep` :

```javascript
import {
  calcGridItemPosition,
  calcGridItemWHPx,
  calcGridColWidth,
  calcXY,
  calcWH,
  clamp,
  applyResizeStep  // ← AJOUTER CETTE LIGNE
} from "./calculateUtils";
```

**3.5. Modifier la méthode `onResizeHandler`**

Localisez la méthode `onResizeHandler` (ligne ~596) et ajoutez la logique de snap :

```javascript
  onResizeHandler(
    e: Event,
    { node, size, handle }: ResizeCallbackData,
    position: Position,
    handlerName: string
  ): void {
    const handler = this.props[handlerName];
    if (!handler) return;
    const { x, y, i, maxH, minH, containerWidth, resizeStep } = this.props;  // ← AJOUTER resizeStep
    const { minW, maxW } = this.props;

    // Clamping of dimensions based on resize direction
    let updatedSize = size;
    if (node) {
      updatedSize = resizeItemInDirection(
        handle,
        position,
        size,
        containerWidth
      );
      flushSync(() => {
        this.setState({
          resizing: handlerName === "onResizeStop" ? null : updatedSize
        });
      });
    }

    // Get new XY based on pixel size
    let { w, h } = calcWH(
      this.getPositionParams(),
      updatedSize.width,
      updatedSize.height,
      x,
      y,
      handle
    );

    // Min/max capping.
    w = clamp(w, Math.max(minW, 1), maxW);
    h = clamp(h, minH, maxH);

    // Apply resize step snapping if resizeStep is defined and > 0
    if (resizeStep && resizeStep > 0) {  // ← AJOUTER CETTE SECTION
      const snapped = applyResizeStep(w, h, resizeStep, Math.max(minW, 1), minH, maxW, maxH);
      w = snapped.w;
      h = snapped.h;
    }

    handler.call(this, i, w, h, { e, node, size: updatedSize, handle });
  }
```

### 4. Création de la fonction utilitaire

#### Fichier: `lib/calculateUtils.js`

**4.1. Ajouter la fonction `applyResizeStep`**

Ajoutez cette fonction à la fin du fichier (après la fonction `clamp`) :

```javascript
/**
 * Apply resize step snapping to width and height values.
 * @param {number} w - Width in grid units
 * @param {number} h - Height in grid units  
 * @param {number} resizeStep - Step size for snapping
 * @param {number} minW - Minimum width
 * @param {number} minH - Minimum height
 * @param {number} maxW - Maximum width
 * @param {number} maxH - Maximum height
 * @return {Object} - Snapped w and h values
 */
export function applyResizeStep(
  w: number,
  h: number,
  resizeStep: number,
  minW: number,
  minH: number,
  maxW: number,
  maxH: number
): { w: number, h: number } {
  if (resizeStep <= 0) return { w, h };
  
  // Snap width to resizeStep increments
  const snappedW = Math.round(w / resizeStep) * resizeStep;
  const finalW = clamp(snappedW, minW, maxW);
  
  // Snap height to resizeStep increments  
  const snappedH = Math.round(h / resizeStep) * resizeStep;
  const finalH = clamp(snappedH, minH, maxH);
  
  return { w: finalW, h: finalH };
}
```

### 5. Création d'un exemple de test

#### Fichier: `test/examples/22-resize-step.jsx`

Créez ce nouveau fichier pour tester la fonctionnalité :

```javascript
import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

export default class ResizeStepLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    items: 6,
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: 12,
    resizeStep: 3 // Test with resize step of 3
  };

  constructor(props) {
    super(props);

    const layout = this.generateLayout();
    this.state = { layout };
  }

  generateDOM() {
    return _.map(_.range(this.props.items), function(i) {
      return (
        <div key={i} className="grid-item">
          <span className="text">Item {i}</span>
          <div className="resize-info">
            <small>Resize with step: {this.props.resizeStep}</small>
          </div>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 3, // Start with width that's a multiple of resizeStep
        h: 3, // Start with height that's a multiple of resizeStep
        i: i.toString()
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
    this.setState({ layout });
  }

  onResize(layout, oldItem, newItem) {
    console.log('Resize event:', {
      oldItem,
      newItem,
      resizeStep: this.props.resizeStep
    });
  }

  render() {
    return (
      <div>
        <div className="info">
          <h3>Resize Step Example</h3>
          <p>Try resizing the items below. They should snap to increments of {this.props.resizeStep}.</p>
          <p>Original sizes: 3x3. With resizeStep=3, valid sizes are: 3, 6, 9, 12, etc.</p>
        </div>
        <ReactGridLayout
          layout={this.state.layout}
          onLayoutChange={this.onLayoutChange}
          onResize={this.onResize}
          resizeStep={this.props.resizeStep}
          {...this.props}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ResizeStepLayout));
}
```

## Utilisation

### Exemple basique

```javascript
import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

function MyGrid() {
  const layouts = {
    lg: [
      { i: "a", x: 0, y: 0, w: 3, h: 3 },
      { i: "b", x: 3, y: 0, w: 3, h: 3 }
    ]
  };

  return (
    <ResponsiveGridLayout
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      resizeStep={3}  // ← Redimensionnement par pas de 3
      isResizable={true}
    >
      <div key="a">Item A</div>
      <div key="b">Item B</div>
    </ResponsiveGridLayout>
  );
}
```

### Comportement attendu

- **`resizeStep={1}`** (défaut) : Comportement normal, pas de snap
- **`resizeStep={3}`** : Les éléments ne peuvent être redimensionnés qu'aux valeurs 3, 6, 9, 12, etc.
- **`resizeStep={0}` ou `undefined`** : Pas de snap, comportement normal

## Tests

Pour tester l'implémentation :

1. **Build du projet** : `make build` ou `npm run build`
2. **Lancer les exemples** : `make dev` ou `npm run dev`
3. **Tester l'exemple** : Naviguer vers l'exemple 22-resize-step

## Notes importantes

- La prop `resizeStep` est **optionnelle** avec une valeur par défaut de `1`
- Elle fonctionne avec tous les composants : `ReactGridLayout`, `ResponsiveReactGridLayout`
- Elle respecte les contraintes `minW`, `maxW`, `minH`, `maxH`
- Elle s'applique uniquement lors du redimensionnement, pas du déplacement
- Compatible avec tous les handles de redimensionnement (`se`, `sw`, `ne`, `nw`, etc.)

## Tests et débogage

### **Lancer le serveur de développement :**

```bash
# Démarrer le serveur de développement
npx webpack serve --config webpack-dev-server.config.js

# Ou avec un port spécifique
npx webpack serve --config webpack-dev-server.config.js --port 4002
```

### **Accéder aux tests :**

1. Ouvrez votre navigateur sur `http://localhost:4002/index-dev.html`
2. Vous devriez voir l'interface de test avec `resizeStep=3`
3. Testez le redimensionnement des éléments
4. Ouvrez la console (F12) pour voir les logs de redimensionnement

### **Tests de la fonction `applyResizeStep` :**

Créez un fichier `test-resize-step.js` pour tester la fonction :

```javascript
function clamp(num, lowerBound, upperBound) {
  return Math.max(Math.min(num, upperBound), lowerBound);
}

function applyResizeStep(w, h, resizeStep, minW, minH, maxW, maxH) {
  if (resizeStep <= 0) return { w, h };
  
  const snappedW = Math.round(w / resizeStep) * resizeStep;
  const finalW = clamp(snappedW, minW, maxW);
  
  const snappedH = Math.round(h / resizeStep) * resizeStep;
  const finalH = clamp(snappedH, minH, maxH);
  
  return { w: finalW, h: finalH };
}

// Tests
console.log('Test 1:', applyResizeStep(5, 4, 3, 1, 1, 12, 12)); // {w: 6, h: 3}
console.log('Test 2:', applyResizeStep(6, 6, 3, 1, 1, 12, 12)); // {w: 6, h: 6}
console.log('Test 3:', applyResizeStep(7, 8, 3, 1, 1, 12, 12)); // {w: 6, h: 9}
```

Puis exécutez : `node test-resize-step.js`

## Fichiers modifiés

1. `lib/ReactGridLayoutPropTypes.js` - Types et PropTypes
2. `lib/ReactGridLayout.jsx` - Props et transmission
3. `lib/GridItem.jsx` - Logique de redimensionnement
4. `lib/calculateUtils.js` - Fonction utilitaire
5. `test/examples/23-resize-step-test.jsx` - Exemple de test (nouveau fichier)
6. `test/dev-hook.jsx` - Chargement du test (modifié)

## Corrections importantes pour éviter les erreurs

### ⚠️ **Erreur courante : `Cannot read properties of undefined (reading 'resizeStep')`**

Cette erreur peut survenir si `resizeStep` n'est pas correctement défini. Voici les corrections à appliquer :

#### **Correction 1 : Ajouter `resizeStep` au type DefaultProps dans GridItem.jsx**

```javascript
type DefaultProps = {
  className: string,
  cancel: string,
  handle: string,
  minH: number,
  minW: number,
  maxH: number,
  maxW: number,
  transformScale: number,
  resizeStep: number  // ← AJOUTER CETTE LIGNE
};
```

#### **Correction 2 : Dans les composants de test, utiliser une propriété d'instance**

Au lieu d'utiliser `this.props.resizeStep`, créez une propriété d'instance :

```javascript
constructor(props) {
  super(props);
  
  // Ensure resizeStep has a default value
  this.resizeStep = props.resizeStep || 3;
  
  const layout = this.generateLayout();
  this.state = { layout };
}

// Puis utiliser this.resizeStep au lieu de this.props.resizeStep
onResize(layout, oldItem, newItem) {
  console.log('Resize event:', {
    resizeStep: this.resizeStep,  // ← Utiliser this.resizeStep
    // ... autres propriétés
  });
}
```

#### **Correction 3 : Vérifier la transmission des props**

Assurez-vous que `resizeStep` est bien passé au composant :

```javascript
<ReactGridLayout
  layout={this.state.layout}
  onLayoutChange={this.onLayoutChange}
  onResize={this.onResize}
  resizeStep={this.resizeStep}  // ← Utiliser this.resizeStep
  isResizable={true}
  isDraggable={true}
  {...this.props}
>
```

## Validation

Après avoir appliqué toutes les modifications :

1. Vérifiez qu'il n'y a pas d'erreurs de syntaxe
2. Testez avec différents valeurs de `resizeStep` (1, 3, 5, etc.)
3. Vérifiez que les contraintes min/max sont respectées
4. Testez avec le composant ResponsiveReactGridLayout
5. **Vérifiez qu'il n'y a pas d'erreurs `undefined` dans la console**
