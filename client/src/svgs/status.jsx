import * as React from "react"
const StatusSVG = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" {...props}>
    <title>{"internet"}</title>
    <g data-name="internet">
      <circle cx={26} cy={26} r={24} fill="#fff" />
      <circle cx={26} cy={26} r={17.5} fill="#26c6da" />
      <path
        fill="#80deea"
        d="M26 2a24 24 0 1 0 24 24A24 24 0 0 0 26 2Zm0 46.08A22.08 22.08 0 1 1 48.08 26 22.1 22.1 0 0 1 26 48.08Z"
      />
      <path
        fill="#80deea"
        d="M26 50c-5.68 0-12.9-11.3-12.9-24S20.32 2 26 2s12.9 11.3 12.9 24S31.68 50 26 50Zm0-46c-3.73 0-10.9 9.29-10.9 22S22.27 48 26 48s10.9-9.29 10.9-22S29.73 4 26 4Z"
      />
      <path fill="#80deea" d="M25 2h2v48h-2z" />
      <path
        fill="#80deea"
        d="M2 25h48v2H2zM26 16c-12.87 0-17.32-5.47-17.5-5.7L10.2 9s4.09 4.88 15.8 4.88S41.76 9 41.8 9l1.7 1.3c-.18.23-4.63 5.7-17.5 5.7ZM26 36c-12.87 0-17.32 5.47-17.5 5.7l1.7 1.3s4.09-4.88 15.8-4.88S41.76 43 41.8 43l1.7-1.3c-.18-.23-4.63-5.7-17.5-5.7Z"
      />
    </g>
  </svg>
)
export default StatusSVG
