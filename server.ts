// const express = require("express");
import express, { Express, Request, Response } from "express";
const app: Express = express();
const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Express server listening on port: ${PORT}`);
});
