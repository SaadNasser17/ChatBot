<div className="chat-container" style={{ width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
{messages.map((msg, index) => (
  <div key={index} className={`d-flex ${msg.type === "user" ? "justify-content-end" : "justify-content-start"} my-2 align-items-center`}>
    <div
      className={`rounded-circle overflow-hidden d-flex justify-content-center align-items-center`}
      style={{
        width: "40px",
        height: "40px",
        marginLeft: msg.type === "user" ? "0.5rem" : "0",
        marginRight: msg.type === "user" ? "0" : "0.5rem",
        backgroundImage: `url(${msg.avatar})`,
        backgroundSize: 'cover'
      }}
    />
    <div className={`chat-bubble ${msg.type === "user" ? "user-bubble" : "bot-bubble"}`}>
      {msg.text}
      <div className="small text-muted mt-1">{msg.time}</div>
    </div>
  </div>
))}
</div>