"use client";

import { useActionState } from "react";
import { createPhoneAction } from "@/app/admin/actions";
import type { Phone } from "@/lib/types";

const initialState = {
  ok: false,
  message: ""
};

function dateValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export function AdminPhoneForm({ accessToken, phone }: { accessToken: string; phone?: Phone | null }) {
  const [state, action, pending] = useActionState(createPhoneAction, initialState);

  return (
    <form className="form-card" action={action}>
      <input name="access_token" type="hidden" value={accessToken} />
      <input name="phone_id" type="hidden" value={phone?.id ?? ""} />
      <h3 style={{ marginTop: 0 }}>{phone ? "Editar celular" : "Cadastrar celular"}</h3>
      <div className="form-grid">
        <div className="field">
          <label>Nome</label>
          <input name="name" defaultValue={phone?.name ?? ""} placeholder="POCO X8 Pro" required />
        </div>
        <div className="field">
          <label>Slug</label>
          <input name="slug" defaultValue={phone?.slug ?? ""} placeholder="poco-x8-pro" required />
        </div>
        <div className="field">
          <label>Marca</label>
          <input name="brand" defaultValue={phone?.brand ?? ""} placeholder="Xiaomi" />
        </div>
        <div className="field">
          <label>Status</label>
          <select name="launch_status" defaultValue={phone?.launchStatus ?? "available"}>
            <option value="available">Disponivel</option>
            <option value="new">Novo</option>
            <option value="rumor">Rumor</option>
          </select>
        </div>
        <div className="field full">
          <label>Imagem</label>
          <input name="image_url" defaultValue={phone?.imageUrl ?? ""} placeholder="https://..." />
        </div>
        <div className="field">
          <label>Preco medio</label>
          <input name="price" type="number" step="0.01" defaultValue={phone?.price ?? ""} placeholder="2590" />
        </div>
        <div className="field">
          <label>Melhor preco</label>
          <input name="best_price" type="number" step="0.01" defaultValue={phone?.bestPrice ?? ""} placeholder="2399" />
        </div>
        <div className="field full">
          <label>Link afiliado principal</label>
          <input name="affiliate_url" defaultValue={phone?.affiliateUrl ?? ""} placeholder="https://..." />
        </div>
        <div className="field">
          <label>Processador</label>
          <input name="chipset" defaultValue={phone?.chipset ?? ""} placeholder="Dimensity 8400 Ultra" />
        </div>
        <div className="field">
          <label>GPU</label>
          <input name="gpu" defaultValue={phone?.gpu ?? ""} placeholder="Mali-G720 / Adreno..." />
        </div>
        <div className="field">
          <label>Sistema</label>
          <input name="os" defaultValue={phone?.os ?? ""} placeholder="Android 16 / HyperOS" />
        </div>
        <div className="field">
          <label>RAM GB</label>
          <input name="ram_gb" type="number" defaultValue={phone?.ramGb ?? ""} placeholder="12" />
        </div>
        <div className="field">
          <label>Tipo de RAM</label>
          <input name="ram_type" defaultValue={phone?.ramType ?? ""} placeholder="LPDDR5X" />
        </div>
        <div className="field">
          <label>Armazenamento GB</label>
          <input name="storage_gb" type="number" defaultValue={phone?.storageGb ?? ""} placeholder="512" />
        </div>
        <div className="field">
          <label>Tipo de armazenamento</label>
          <input name="storage_type" defaultValue={phone?.storageType ?? ""} placeholder="UFS 4.0" />
        </div>
        <div className="field">
          <label>Tela</label>
          <input name="display" defaultValue={phone?.display ?? ""} placeholder="6.67 AMOLED, 1.5K" />
        </div>
        <div className="field">
          <label>Tipo de tela</label>
          <input name="screen_type" defaultValue={phone?.screenType ?? ""} placeholder="AMOLED / LTPO OLED" />
        </div>
        <div className="field">
          <label>Resolucao da tela</label>
          <input name="screen_resolution" defaultValue={phone?.screenResolution ?? ""} placeholder="2712 x 1220 pixels" />
        </div>
        <div className="field">
          <label>Hz</label>
          <input name="display_hz" type="number" defaultValue={phone?.displayHz ?? ""} placeholder="120" />
        </div>
        <div className="field">
          <label>Bateria mAh</label>
          <input name="battery_mah" type="number" defaultValue={phone?.batteryMah ?? ""} placeholder="5000" />
        </div>
        <div className="field">
          <label>Carregamento W</label>
          <input name="charging_w" type="number" defaultValue={phone?.chargingW ?? ""} placeholder="90" />
        </div>
        <div className="field">
          <label>Camera principal MP</label>
          <input name="main_camera_mp" type="number" defaultValue={phone?.mainCameraMp ?? ""} placeholder="50" />
        </div>
        <div className="field">
          <label>Camera ultrawide MP</label>
          <input name="ultrawide_camera_mp" type="number" defaultValue={phone?.ultrawideCameraMp ?? ""} placeholder="8" />
        </div>
        <div className="field">
          <label>Camera telefoto MP</label>
          <input name="telephoto_camera_mp" type="number" defaultValue={phone?.telephotoCameraMp ?? ""} placeholder="50" />
        </div>
        <div className="field">
          <label>Camera frontal MP</label>
          <input name="selfie_camera_mp" type="number" defaultValue={phone?.selfieCameraMp ?? ""} placeholder="20" />
        </div>
        <div className="field">
          <label>Video</label>
          <input name="video" defaultValue={phone?.video ?? ""} placeholder="4K" />
        </div>
        <div className="field">
          <label>AnTuTu</label>
          <input name="antutu_score" type="number" defaultValue={phone?.antutuScore ?? ""} placeholder="1450000" />
        </div>
        <div className="field">
          <label>Versao AnTuTu</label>
          <input name="antutu_version" defaultValue={phone?.antutuVersion ?? ""} placeholder="v11" />
        </div>
        <div className="field">
          <label>Altura mm</label>
          <input name="height_mm" type="number" step="0.01" defaultValue={phone?.heightMm ?? ""} placeholder="162.9" />
        </div>
        <div className="field">
          <label>Largura mm</label>
          <input name="width_mm" type="number" step="0.01" defaultValue={phone?.widthMm ?? ""} placeholder="77.9" />
        </div>
        <div className="field">
          <label>Espessura mm</label>
          <input
            name="thickness_mm"
            type="number"
            step="0.01"
            defaultValue={phone?.thicknessMm ?? ""}
            placeholder="8.1"
          />
        </div>
        <div className="field">
          <label>Peso g</label>
          <input name="weight_g" type="number" defaultValue={phone?.weightG ?? ""} placeholder="218" />
        </div>
        <div className="field">
          <label>Resistencia</label>
          <input name="water_resistance" defaultValue={phone?.waterResistance ?? ""} placeholder="IP68" />
        </div>
        <div className="field">
          <label>Protecao da tela</label>
          <input name="protection" defaultValue={phone?.protection ?? ""} placeholder="Gorilla Glass Victus" />
        </div>
        <div className="field">
          <label>USB</label>
          <input name="usb_type" defaultValue={phone?.usbType ?? ""} placeholder="USB-C 2.0" />
        </div>
        <div className="field">
          <label>Wi-Fi</label>
          <input name="wifi" defaultValue={phone?.wifi ?? ""} placeholder="Wi-Fi 6 / 7" />
        </div>
        <div className="field">
          <label>Bluetooth</label>
          <input name="bluetooth" defaultValue={phone?.bluetooth ?? ""} placeholder="5.4" />
        </div>
        <div className="field">
          <label>GPS</label>
          <input name="gps" defaultValue={phone?.gps ?? ""} placeholder="GPS, GLONASS, Galileo" />
        </div>
        <div className="field full">
          <label>Bandas e redes</label>
          <textarea name="network_bands" defaultValue={phone?.networkBands ?? ""} placeholder="5G: n1, n3, n7... / 4G: B1, B3..." />
        </div>
        <div className="field full">
          <label>Recursos</label>
          <div className="checkbox-grid">
            <label className="checkbox-line">
              <input name="five_g" type="checkbox" defaultChecked={phone?.fiveG ?? true} /> 5G
            </label>
            <label className="checkbox-line">
              <input name="nfc" type="checkbox" defaultChecked={phone?.nfc ?? true} /> NFC
            </label>
            <label className="checkbox-line">
              <input name="dual_sim" type="checkbox" defaultChecked={phone?.dualSim ?? true} /> Dual SIM
            </label>
            <label className="checkbox-line">
              <input name="esim" type="checkbox" defaultChecked={phone?.esim ?? false} /> eSIM
            </label>
            <label className="checkbox-line">
              <input name="memory_card" type="checkbox" defaultChecked={phone?.memoryCard ?? false} /> Cartao de memoria
            </label>
            <label className="checkbox-line">
              <input name="stereo_speakers" type="checkbox" defaultChecked={phone?.stereoSpeakers ?? true} /> Som stereo
            </label>
            <label className="checkbox-line">
              <input name="audio_jack" type="checkbox" defaultChecked={phone?.audioJack ?? false} /> Entrada P2
            </label>
          </div>
        </div>
        <div className="field">
          <label>Lancamento</label>
          <input name="release_date" type="date" defaultValue={dateValue(phone?.releaseDate)} />
        </div>
        <div className="field">
          <label>Nota desempenho</label>
          <input
            name="score_performance"
            type="number"
            step="0.1"
            min="0"
            max="10"
            defaultValue={phone?.scorePerformance ?? ""}
            placeholder="9.3"
          />
        </div>
        <div className="field">
          <label>Nota camera</label>
          <input
            name="score_camera"
            type="number"
            step="0.1"
            min="0"
            max="10"
            defaultValue={phone?.scoreCamera ?? ""}
            placeholder="7.7"
          />
        </div>
        <div className="field">
          <label>Nota bateria</label>
          <input
            name="score_battery"
            type="number"
            step="0.1"
            min="0"
            max="10"
            defaultValue={phone?.scoreBattery ?? ""}
            placeholder="8.5"
          />
        </div>
        <div className="field">
          <label>Nota tela</label>
          <input
            name="score_display"
            type="number"
            step="0.1"
            min="0"
            max="10"
            defaultValue={phone?.scoreDisplay ?? ""}
            placeholder="8.9"
          />
        </div>
        <div className="field">
          <label>Nota construcao</label>
          <input
            name="score_build"
            type="number"
            step="0.1"
            min="0"
            max="10"
            defaultValue={phone?.scoreBuild ?? ""}
            placeholder="8.2"
          />
        </div>
        <div className="field">
          <label>Nota custo-beneficio</label>
          <input
            name="score_value"
            type="number"
            step="0.1"
            min="0"
            max="10"
            defaultValue={phone?.scoreValue ?? ""}
            placeholder="9.1"
          />
        </div>
        <div className="field full">
          <label>Veredito</label>
          <textarea name="verdict" defaultValue={phone?.verdict ?? ""} placeholder="Vale a pena ate R$ 2700..." />
        </div>
        <div className="field full">
          <label>Pros</label>
          <textarea name="pros" defaultValue={phone?.pros ?? ""} placeholder="Um ponto por linha: desempenho forte, tela boa..." />
        </div>
        <div className="field full">
          <label>Contras</label>
          <textarea name="cons" defaultValue={phone?.cons ?? ""} placeholder="Um ponto por linha: sem carregador, esquenta..." />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
        <button className="button" disabled={pending} type="submit">
          {pending ? "Salvando..." : "Salvar celular"}
        </button>
        {state.message ? <span className={state.ok ? "winner" : "muted"}>{state.message}</span> : null}
      </div>
    </form>
  );
}
