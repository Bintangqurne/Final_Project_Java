package com.finprodb.backendjava.payment;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class MidtransClient {
  private final RestTemplate restTemplate;
  private final MidtransProperties properties;

  public MidtransClient(RestTemplate restTemplate, MidtransProperties properties) {
    this.restTemplate = restTemplate;
    this.properties = properties;
  }

  @SuppressWarnings("unchecked")
  public Map<String, Object> createSnapTransaction(Map<String, Object> payload) {
    String url = properties.snapBaseUrl() + "/snap/v1/transactions";

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Accept", "application/json");
    headers.set("Authorization", basicAuth(properties.getServerKey()));

    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
    ResponseEntity<Map> resp = restTemplate.postForEntity(url, entity, Map.class);
    return resp.getBody();
  }

  private static String basicAuth(String serverKey) {
    String raw = serverKey + ":";
    String encoded = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    return "Basic " + encoded;
  }
}
