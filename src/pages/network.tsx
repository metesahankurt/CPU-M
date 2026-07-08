import { Network, Router, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/shared/badge";
import { FieldRow } from "@/components/shared/field-row";
import { InfoCard } from "@/components/shared/info-card";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { usePolling } from "@/hooks/use-polling";
import { fieldValue } from "@/lib/field";
import { formatBytes, formatPercent } from "@/lib/format";
import type { Field } from "@/lib/field";
import type { NetworkInfo } from "@/types/hardware";

function bytesField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: formatBytes(field.value) }
    : field;
}

function listField(values: string[]): Field<string> {
  return values.length > 0
    ? { status: "ok", value: values.join(", ") }
    : { status: "unavailable" };
}

function percentField(field: Field<number>): Field<string> {
  return field.status === "ok"
    ? { status: "ok", value: formatPercent(field.value, 0) }
    : field;
}

export function NetworkPage() {
  const { t } = useTranslation("Network");
  const data = usePolling<NetworkInfo>("get_network_info");

  if (!data) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoCard icon={Router} title={t("route")}>
          <FieldRow field={data.defaultInterface} label={t("defaultInterface")} />
          <FieldRow field={data.defaultGateway} label={t("defaultGateway")} />
          <FieldRow field={listField(data.dnsServers)} label={t("dnsServers")} />
          <FieldRow
            field={listField(data.searchDomains)}
            label={t("searchDomains")}
          />
        </InfoCard>

        <InfoCard icon={Wifi} title={t("wifi")}>
          <FieldRow field={data.wifi.interfaceName} label={t("interface")} />
          <FieldRow field={data.wifi.ssid} label={t("ssid")} />
          <FieldRow
            field={percentField(data.wifi.signalQualityPercent)}
            label={t("signal")}
          />
          <FieldRow field={data.wifi.channel} label={t("channel")} />
          <FieldRow field={data.wifi.security} label={t("security")} />
        </InfoCard>
      </div>

      <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
        {t("interfaces")}
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.interfaces.map((iface, i) => {
          const isDefault = fieldValue(iface.isDefault);
          const isLoopback = fieldValue(iface.isLoopback);
          return (
            <InfoCard
              icon={Network}
              key={`net-${fieldValue(iface.name) ?? i.toFixed()}`}
              title={fieldValue(iface.displayName) ?? `${t("interface")} ${i + 1}`}
            >
              <div className="flex flex-wrap gap-1.5 py-1">
                {isDefault && <Badge variant="success">{t("default")}</Badge>}
                {isLoopback && <Badge variant="muted">{t("loopback")}</Badge>}
                {fieldValue(iface.kind) && (
                  <Badge variant="muted">{fieldValue(iface.kind)}</Badge>
                )}
              </div>
              <FieldRow field={iface.name} label={t("name")} mono={true} />
              <FieldRow field={iface.macAddress} label={t("macAddress")} mono={true} />
              <FieldRow field={listField(iface.ipAddresses)} label={t("ipAddresses")} />
              <FieldRow field={iface.mtu} label={t("mtu")} />
              <FieldRow
                field={bytesField(iface.receivedBytes)}
                label={t("received")}
              />
              <FieldRow
                field={bytesField(iface.transmittedBytes)}
                label={t("transmitted")}
              />
              <FieldRow field={iface.packetsReceived} label={t("packetsReceived")} />
              <FieldRow
                field={iface.packetsTransmitted}
                label={t("packetsTransmitted")}
              />
              <FieldRow field={iface.errorsReceived} label={t("errorsReceived")} />
              <FieldRow
                field={iface.errorsTransmitted}
                label={t("errorsTransmitted")}
              />
            </InfoCard>
          );
        })}
      </div>
    </div>
  );
}
