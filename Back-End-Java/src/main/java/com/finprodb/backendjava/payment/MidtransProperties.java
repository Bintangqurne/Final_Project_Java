package com.finprodb.backendjava.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.midtrans")
public class MidtransProperties {
  private String serverKey;
  private boolean production;

  public String getServerKey() {
    return serverKey;
  }

  public void setServerKey(String serverKey) {
    this.serverKey = serverKey;
  }

  public boolean isProduction() {
    return production;
  }

  public void setProduction(boolean production) {
    this.production = production;
  }

  public String snapBaseUrl() {
    return production ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  }
}
