import React from 'react'
import Initializer from '../../../Initializer'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <section className={className+'/Section'}>
      <header className={className+'/Section-Name'}>
        Mesh
      </header>
      <div className={className+'/Section-Content'}>
        <div className={className+'-FieldValue'}>
          <select className={className+'-FieldInput '+className+'-MeshName'}>
            <option value="teapot" selected={true}>Teapot</option>
            <option value="cube">Cube</option>
            <option value="quad">Plane</option>
            <option value="sphere">Sphere</option>
            <option value="file">.obj File</option>
          </select>
          <input type="file" className={className+'-MeshFile'}/>
        </div>
        <p className={className+'/Section-ContentInfo vertex-count'}>
          Vertices: <span className={className+'-VertexCount'}>0</span>
        </p>
        <div className={className+'/Section-ContentInfo attributes'}>
          <div style={{display: 'inline-block', verticalAlign: 'top'}}>Attributes:&nbsp;</div>
          <ul style={{display: 'inline-block'}}>
            <li><span className={className+'-VertexType'}>float</span> vertex_worldSpace</li>
            <li><span className={className+'-NormalType'}>no</span> normal_worldSpace</li>
            <li><span className={className+'-TCoordType'}>no</span> textureCoordinate_input</li>
          </ul>
        </div>
      </div>
    </section>
    <section className={className+'/Section'}>
      <header className={className+'/Section-Name'}>
        Position & Transform
      </header>
      <div className={className+'/Section-Content'}>
        <p className={className+'/Section-ContentInfo'}>
          The Model Matrix is calculated as: Model Matrix = Position * Rotation * Scale.
        </p>
        <div className={className+'-Field position'}>
          <div className={className+'-FieldLabel'}>
            Position:
          </div>
          <div className={className+'-FieldValue'}>
            <input type="number" defaultValue="0" step="any" className={className+'-FieldInput position x'}/>
            <input type="number" defaultValue="0" step="any" className={className+'-FieldInput position y'}/>
            <input type="number" defaultValue="0" step="any" className={className+'-FieldInput position z'}/>
          </div>
        </div>
        <div className={className+'-Field rotationAxis'}>
          <div className={className+'-FieldLabel'}>
            Rotation Axis:
          </div>
          <div className={className+'-FieldValue'}>
            <input type="number" defaultValue="0" step="any" className={className+'-FieldInput rotationAxis x'}/>
            <input type="number" defaultValue="0" step="any" className={className+'-FieldInput rotationAxis y'}/>
            <input type="number" defaultValue="1" step="any" className={className+'-FieldInput rotationAxis z'}/>
          </div>
        </div>
        <div className={className+'-Field rotationAngle'}>
          <div className={className+'-FieldLabel'}>
            Rotation Angle:
          </div>
          <div className={className+'-FieldValue'}>
            <input type="number" defaultValue="0" step="any" className={className+'-FieldInput rotationAngle'}/>
          </div>
        </div>
        <div className={className+'-Field scale'}>
          <div className={className+'-FieldLabel'}>
            Scale:
          </div>
          <div className={className+'-FieldValue'}>
            <input type="number" defaultValue="1" step="any" className={className+'-FieldInput scale x'}/>
            <input type="number" defaultValue="1" step="any" className={className+'-FieldInput scale y'}/>
            <input type="number" defaultValue="1" step="any" className={className+'-FieldInput scale z'}/>
          </div>
        </div>
      </div>
    </section>
    <section className={className+'/Section'}>
      <header className={className+'/Section-Name'}>
        Render Options
      </header>
      <div className={className+'/Section-Content'}>
        <div className={className+'-Field depth-test'}>
          <div className={className+'-FieldLabel'}>
            Depth Test:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput depthTest'}>
              <option value="">Disabled</option>
              <option value="NEVER">Never</option>
              <option value="LESS" selected={true}>Less</option>
              <option value="LEQUAL">Less Or Equal</option>
              <option value="EQUAL">Equal</option>
              <option value="NOTEQUAL">Not Equal</option>
              <option value="GEQUAL">Greater Or Equal</option>
              <option value="GREATER">Greater</option>
              <option value="ALWAYS">Always</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field front-face'}>
          <div className={className+'-FieldLabel'}>
            Front Face:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput frontFace'}>
              <option value="CCW">Counter-clock-wise winding</option>
              <option value="CW">Clock-wise winding</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field face-culling'}>
          <div className={className+'-FieldLabel'}>
            Face Culling:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput faceCulling'}>
              <option value="">Disabled</option>
              <option value="BACK">Back</option>
              <option value="FRONT">Front</option>
              <option value="FRONT_AND_BACK">Front & Back</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field blendEnable'}>
          <div className={className+'-FieldLabel'}>
            Blend Enabled:
          </div>
          <div className={className+'-FieldValue'}>
            <input type='checkbox' className={className+'-FieldInput blendEnable'}/>
          </div>
        </div>
        <div className={className+'-Field blend-operation'}>
          <div className={className+'-FieldLabel'}>
            Blend Operation:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput blendOperation'}>
              <option value="FUNC_ADD" selected={true}>Additive</option>
              <option value="FUNC_SUBTRACT">Subtractive</option>
              <option value="FUNC_REVERSE_SUBTRACT">Reverse Subtractive</option>
              <option value="MIN">Minimum</option>
              <option value="MAX">Maximum</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field src-color-blend-factor'}>
          <div className={className+'-FieldLabel'}>
            Src Color Blend Factor:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput srcColorBlendFactor'}>
              <option value="ZERO">ZERO</option>
              <option value="ONE">ONE</option>
              <option value="SRC_COLOR">SRC_COLOR</option>
              <option value="ONE_MINUS_SRC_COLOR">ONE_MINUS_SRC_COLOR</option>
              <option value="DST_COLOR">DST_COLOR</option>
              <option value="ONE_MINUS_DST_COLOR">ONE_MINUS_DST_COLOR</option>
              <option value="SRC_ALPHA" selected={true}>SRC_ALPHA</option>
              <option value="ONE_MINUS_SRC_ALPHA">ONE_MINUS_SRC_ALPHA</option>
              <option value="DST_ALPHA">DST_ALPHA</option>
              <option value="ONE_MINUS_DST_ALPHA">ONE_MINUS_DST_ALPHA</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field dst-color-blend-factor'}>
          <div className={className+'-FieldLabel'}>
            Dst Color Blend Factor:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput dstColorBlendFactor'}>
              <option value="ZERO">ZERO</option>
              <option value="ONE">ONE</option>
              <option value="SRC_COLOR">SRC_COLOR</option>
              <option value="ONE_MINUS_SRC_COLOR">ONE_MINUS_SRC_COLOR</option>
              <option value="DST_COLOR">DST_COLOR</option>
              <option value="ONE_MINUS_DST_COLOR">ONE_MINUS_DST_COLOR</option>
              <option value="SRC_ALPHA">SRC_ALPHA</option>
              <option value="ONE_MINUS_SRC_ALPHA" selected={true}>ONE_MINUS_SRC_ALPHA</option>
              <option value="DST_ALPHA">DST_ALPHA</option>
              <option value="ONE_MINUS_DST_ALPHA">ONE_MINUS_DST_ALPHA</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field src-alpha-blend-factor'}>
          <div className={className+'-FieldLabel'}>
            Src Alpha Blend Factor:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput srcAlphaBlendFactor'}>
              <option value="ZERO">ZERO</option>
              <option value="ONE">ONE</option>
              <option value="SRC_COLOR">SRC_COLOR</option>
              <option value="ONE_MINUS_SRC_COLOR">ONE_MINUS_SRC_COLOR</option>
              <option value="DST_COLOR">DST_COLOR</option>
              <option value="ONE_MINUS_DST_COLOR">ONE_MINUS_DST_COLOR</option>
              <option value="SRC_ALPHA" selected={true}>SRC_ALPHA</option>
              <option value="ONE_MINUS_SRC_ALPHA">ONE_MINUS_SRC_ALPHA</option>
              <option value="DST_ALPHA">DST_ALPHA</option>
              <option value="ONE_MINUS_DST_ALPHA">ONE_MINUS_DST_ALPHA</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field dst-alpha-blend-factor'}>
          <div className={className+'-FieldLabel'}>
            Dst Alpha Blend Factor:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput dstAlphaBlendFactor'}>
              <option value="ZERO">ZERO</option>
              <option value="ONE">ONE</option>
              <option value="SRC_COLOR">SRC_COLOR</option>
              <option value="ONE_MINUS_SRC_COLOR">ONE_MINUS_SRC_COLOR</option>
              <option value="DST_COLOR">DST_COLOR</option>
              <option value="ONE_MINUS_DST_COLOR">ONE_MINUS_DST_COLOR</option>
              <option value="SRC_ALPHA">SRC_ALPHA</option>
              <option value="ONE_MINUS_SRC_ALPHA" selected={true}>ONE_MINUS_SRC_ALPHA</option>
              <option value="DST_ALPHA">DST_ALPHA</option>
              <option value="ONE_MINUS_DST_ALPHA">ONE_MINUS_DST_ALPHA</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field texture-filtering'}>
          <div className={className+'-FieldLabel'}>
            Texture Filtering:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput textureFiltering'}>
              <option value="NEAREST">Nearest</option>
              <option value="LINEAR">Linear</option>
              <option value="NEAREST_MIPMAP_NEAREST">Nearest Mipmap Nearest</option>
              <option value="LINEAR_MIPMAP_NEAREST">Linear Mipmap Nearest</option>
              <option value="NEAREST_MIPMAP_LINEAR">Nearest Mipmap Linear</option>
              <option value="LINEAR_MIPMAP_LINEAR" selected={true}>Linear Mipmap Linear</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field max-anisotropy'}>
          <div className={className+'-FieldLabel'}>
            Max. Anisotropy:
          </div>
          <div className={className+'-FieldValue'}>
            <select className={className+'-FieldInput maxAnisotropy'}>
              <option value="1" selected={true}>1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
            </select>
          </div>
        </div>
        <div className={className+'-Field showWireframe'}>
          <div className={className+'-FieldLabel'}>
            Show Wireframe:
          </div>
          <div className={className+'-FieldValue'}>
            <input type='checkbox' className={className+'-FieldInput showWireframe'}/>
          </div>
        </div>
        <div className={className+'-Field showWorldCoordinates'}>
          <div className={className+'-FieldLabel'}>
            Show World Coordinates:
          </div>
          <div className={className+'-FieldValue'}>
            <input type='checkbox' className={className+'-FieldInput showWorldCoordinates'}/>
          </div>
        </div>
      </div>
    </section>
    <Initializer/>
  </div>
)