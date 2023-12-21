function TrackModel(props) {
  return (
    <div className="trackModel">
      <div className="trackModelContent">
        {/* eslint-disable-next-line react/prop-types */}
        <div className="trackModelBody">{props?.children ?? <></>}</div>
      </div>
    </div>
  );
}

export default TrackModel;
