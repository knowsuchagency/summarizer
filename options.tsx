import {
  Button,
  Container,
  SegmentedControl,
  Text,
  TextInput
} from "@mantine/core"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { clearCache } from "~cache"
import storage from "~storage"

export default function Options() {
  const [apiKey, setApiKey] = useStorage({
    key: "kagiToken",
    instance: storage
  })

  const [model, setModel] = useStorage("kagiSummarizerModel", (v) =>
    v === undefined ? "agnes" : v
  )

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      }}>
      <TextInput
        label="Enter your Kagi API key"
        placeholder="e.g. xxxxxxxx.xxxxxxxxxxxx"
        value={apiKey}
        onChange={(event) => setApiKey(event.currentTarget.value)}
        style={{ marginBottom: "1rem", minWidth: "300px" }}
      />
      {/*<Text>Select Model</Text>*/}
      {/*<SegmentedControl*/}
      {/*  data={[*/}
      {/*    { label: "Technical", value: "agnes" },*/}
      {/*    { label: "Casual", value: "daphne" }*/}
      {/*  ]}*/}
      {/*  value={model}*/}
      {/*  onChange={setModel}*/}
      {/*/>*/}
    </Container>
  )
}
