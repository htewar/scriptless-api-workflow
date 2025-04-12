import FormData from "form-data";
import qs from "qs";
import { HTTPNode } from "../models/workflow";
import { AxiosRequestConfig } from "axios";
import logger from "../utils/logger";

export const buildAxiosRequestConfig = async (
  node: HTTPNode,
  resolvedUrl: string,
  resolvedHeaders: Record<string, string>,
  resolvedQueryParams: Record<string, string>,
  resolvedPayload: Record<string, any>
): Promise<AxiosRequestConfig> => {
  let headers = { ...resolvedHeaders };
  let data: any;

  // ensure node.body is defined and has a type
  const bodyType = node.body?.type || "raw";

  logger.info(`Request Body type is: ${bodyType}`);

  switch (bodyType) {
    case "raw": {
      if (Object.keys(resolvedPayload).length > 0) {
        data = resolvedPayload;
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        break;
      }
    }
    case "form-data": {
      const formData = new FormData();
      for (const key in resolvedPayload) {
        formData.append(key, resolvedPayload[key]);
      }
      data = formData;
      headers = {
        ...headers,
        ...formData.getHeaders(),
      };
      break;
    }
    case "binary": {
      // handles base64-encoded string
      const base64Str = resolvedPayload.data;
      if (typeof base64Str !== "string") {
        throw new Error(
          "Binary payload must include a base64-encoded 'data' string."
        );
      }
      data = Buffer.from(base64Str, "base64");
      headers["Content-Type"] =
        resolvedPayload.contentType || "application/octet-stream";
      break;
    }

    case "x-www-form-urlencoded": {
      if (Object.keys(resolvedPayload).length > 0) {
        data = qs.stringify(resolvedPayload);
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
      break;
    }

    case "graphql": {
      data = {
        query: resolvedPayload.query,
        variables: resolvedPayload.variables || {},
      };
      headers = {
        ...headers,
        "Content-Type": "application/json",
      };
      break;
    }

    default:
      throw new Error(`Unsupported body type: ${node.body.type}`);
  }

  const config: AxiosRequestConfig = {
    method: node.method,
    url: resolvedUrl,
    headers,
  };

  // Add only if not empty
  if (Object.keys(resolvedQueryParams).length > 0) {
    config.params = resolvedQueryParams;
  }

  if (data !== undefined) {
    config.data = data;
  }

  return config;
};
