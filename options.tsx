import { Button, Container, Text, TextInput } from "@mantine/core"

import { useStorage } from "@plasmohq/storage/hook"

import storage from "~storage"

export default function OptionsPage() {
  const [apiKey, setApiKey] = useStorage({
    key: "kagiToken",
    instance: storage
  })

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      }}>
      <Text
        style={{ marginBottom: "1rem", fontSize: "2rem", fontWeight: "bold" }}>
        Kagi API Key
      </Text>
      <TextInput
        label="Enter your Kagi API key"
        placeholder="e.g. xxxxxxxx.xxxxxxxxxxxx"
        value={apiKey}
        onChange={(event) => setApiKey(event.currentTarget.value)}
        style={{ marginBottom: "1rem", minWidth: "300px" }}
      />
      <Button
        variant="outline"
        color="blue"
        onClick={
          () => alert("API key saved!") /*replace with actual save function*/
        }
        style={{ minWidth: "150px" }}>
        Save
      </Button>
    </Container>
  )
}
