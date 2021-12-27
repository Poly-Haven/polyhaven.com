const Icon = ({ color, text }) => {
  return (
    <div style={{ lineHeight: 0, position: 'relative' }}>
      <svg width="1em" height="1em" viewBox="0 0 12 12"><path fill={color} d="M10.5,3.375l0,7.125c0,0.413 -0.337,0.75 -0.75,0.75l-7.5,0c-0.413,0 -0.75,-0.337 -0.75,-0.75l0,-9c0,-0.413 0.337,-0.75 0.75,-0.75l5.625,0l2.625,2.625Zm-0.75,0.375l-2.25,-2.25l-5.25,0l0,9l7.5,0l0,-6.75Z" /></svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        // left: '0.8em',
        width: '1.4rem',
        textAlign: 'center',
        fontSize: '0.65em',
      }}>{text}</div>
    </div>
  )
}

Icon.defaultProps = {
  color: "currentColor",
  text: "",
}

export default Icon


