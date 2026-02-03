import { html, nothing } from "lit";
import type { SignalStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

import { t } from "../i18n";
export function renderSignalCard(params: {
  props: ChannelsProps;
  signal?: SignalStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, signal, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t().ui.views.channels.signal.title}</div>
      <div class="card-sub">signal-cli status and channel configuration.</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t().ui.views.channels.configured}</span>
          <span>${signal?.configured ? t().ui.views.channels.yes : t().ui.views.channels.no}</span>
        </div>
        <div>
          <span class="label">${t().ui.views.channels.running}</span>
          <span>${signal?.running ? t().ui.views.channels.yes : t().ui.views.channels.no}</span>
        </div>
        <div>
          <span class="label">Base URL</span>
          <span>${signal?.baseUrl ?? t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${signal?.lastStartAt ? formatAgo(signal.lastStartAt) : t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${signal?.lastProbeAt ? formatAgo(signal.lastProbeAt) : t().ui.views.channels.na}</span>
        </div>
      </div>

      ${
        signal?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${signal.lastError}
          </div>`
          : nothing
      }

      ${
        signal?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            Probe ${signal.probe.ok ? "ok" : "failed"} ·
            ${signal.probe.status ?? ""} ${signal.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "signal", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          Probe
        </button>
      </div>
    </div>
  `;
}
