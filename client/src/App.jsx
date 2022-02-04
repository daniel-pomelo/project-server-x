const React = require("react");

export const App = () => {
  const [clientMessage, setClientMessage] = React.useState("");

  React.useEffect(() => {
    setTimeout(() => {
      setClientMessage("Hello From React");
    }, 2000);
  });

  return (
    <>
      <h1>Hello World!</h1>
      <h2>{clientMessage}</h2>
    </>
  );
};
