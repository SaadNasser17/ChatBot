export function getMessageStyle(message) {
    let baseStyle = {
      backgroundColor: message.type === "user" ? "#CBF8F5" : "#CEF0FC",
      wordWrap: "break-word",
      overflowWrap: "anywhere",
      display: "inline-block" ,
      margin:'5px',
      borderRadius: "20px",
      padding: "8px 12px",
      maxWidth: "80%",
      alignSelf: 'flex-end',
      
    };
  
    return baseStyle;
  }
  