"use client";

import { useActionState, useMemo, useState } from "react";
import { createPhoneAction } from "@/app/admin/actions";
import type { Phone } from "@/lib/types";

const initialState = { ok: false, message: "" };
const tabs = ["Básico", "Preços", "Hardware", "Tela/Câmera", "Extras", "Editorial", "Notas"];

function dateValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminPhoneForm({ accessToken, phone }: { accessToken: string; phone?: Phone | null }) {
  const [state, action, pending] = useActionState(createPhoneAction, initialState);
  const [tab, setTab] = useState(tabs[0]);
  const [name, setName] = useState(phone?.name ?? "");
  const [slug, setSlug] = useState(phone?.slug ?? "");
  const isDuplicate = useMemo(() => false, []);

  function updateName(value: string) {
    setName(value);
    if (!phone && (!slug || slug === slugify(name))) setSlug(slugify(value));
  }

  return (
    <form className="form-card" action={action}>
      <input name="access_token" type="hidden" value={accessToken} />
      <input name="phone_id" type="hidden" value={phone?.id ?? ""} />
      <div className="admin-heading">
        <div>
          <h3>{phone ? "Editar celular" : "Cadastrar celular"}</h3>
          <p className="muted">Cadastro em etapas, com slug automático e campos editoriais.</p>
        </div>
        {phone ? (
          <button className="button ghost" type="button" onClick={() => { setName(`${phone.name} cópia`); setSlug(`${phone.slug}-copia`); }}>
            Duplicar dados
          </button>
        ) : null}
      </div>

      <div className="admin-tabs">
        {tabs.map((item) => (
          <button className={item === tab ? "active" : ""} key={item} type="button" onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div className={tab === "Básico" ? "field" : "hidden-field"}>
          <label>Nome</label>
          <input name="name" value={name} onChange={(event) => updateName(event.target.value)} placeholder="POCO X8 Pro" required />
        </div>
        <div className={tab === "Básico" ? "field" : "hidden-field"}>
          <label>Slug</label>
          <input name="slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="poco-x8-pro" required />
        </div>
        <div className={tab === "Básico" ? "field" : "hidden-field"}>
          <label>Marca</label>
          <input name="brand" defaultValue={phone?.brand ?? ""} placeholder="Xiaomi" />
        </div>
        <div className={tab === "Básico" ? "field" : "hidden-field"}>
          <label>Status de lançamento</label>
          <select name="launch_status" defaultValue={phone?.launchStatus ?? "available"}>
            <option value="available">Disponível</option><option value="new">Novo</option><option value="rumor">Rumor</option>
          </select>
        </div>
        <div className={tab === "Básico" ? "field" : "hidden-field"}>
          <label>Publicação</label>
          <select name="publication_status" defaultValue={phone?.publicationStatus ?? "draft"}>
            <option value="draft">Rascunho</option><option value="review">Revisão</option><option value="published">Publicado</option><option value="archived">Arquivado</option>
          </select>
        </div>
        <div className={tab === "Básico" ? "field" : "hidden-field"}>
          <label>Lançamento</label>
          <input name="release_date" type="date" defaultValue={dateValue(phone?.releaseDate)} />
        </div>
        <div className={tab === "Básico" ? "field full" : "hidden-field"}>
          <label>Imagem https://</label>
          <input name="image_url" defaultValue={phone?.imageUrl ?? ""} placeholder="https://..." />
        </div>

        <div className={tab === "Preços" ? "field" : "hidden-field"}><label>Preço médio</label><input name="price" type="number" step="0.01" defaultValue={phone?.price ?? ""} /></div>
        <div className={tab === "Preços" ? "field" : "hidden-field"}><label>Melhor preço</label><input name="best_price" type="number" step="0.01" defaultValue={phone?.bestPrice ?? ""} /></div>
        <div className={tab === "Preços" ? "field" : "hidden-field"}><label>Menor preço histórico</label><input name="min_historical_price" type="number" step="0.01" defaultValue={phone?.minHistoricalPrice ?? ""} /></div>
        <div className={tab === "Preços" ? "field" : "hidden-field"}><label>Prioridade editorial</label><input name="editorial_priority" type="number" defaultValue={phone?.editorialPriority ?? ""} /></div>
        <div className={tab === "Preços" ? "field full" : "hidden-field"}><label>Link afiliado principal https://</label><input name="affiliate_url" defaultValue={phone?.affiliateUrl ?? ""} placeholder="https://..." /></div>

        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>Processador</label><input name="chipset" defaultValue={phone?.chipset ?? ""} /></div>
        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>GPU</label><input name="gpu" defaultValue={phone?.gpu ?? ""} /></div>
        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>Sistema</label><input name="os" defaultValue={phone?.os ?? ""} /></div>
        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>RAM GB</label><input name="ram_gb" type="number" defaultValue={phone?.ramGb ?? ""} /></div>
        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>Tipo RAM</label><input name="ram_type" defaultValue={phone?.ramType ?? ""} /></div>
        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>Armazenamento GB</label><input name="storage_gb" type="number" defaultValue={phone?.storageGb ?? ""} /></div>
        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>Tipo armazenamento</label><input name="storage_type" defaultValue={phone?.storageType ?? ""} /></div>
        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>AnTuTu</label><input name="antutu_score" type="number" defaultValue={phone?.antutuScore ?? ""} /></div>
        <div className={tab === "Hardware" ? "field" : "hidden-field"}><label>Versão AnTuTu</label><input name="antutu_version" defaultValue={phone?.antutuVersion ?? ""} /></div>

        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Tela</label><input name="display" defaultValue={phone?.display ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Tamanho pol.</label><input name="screen_size_in" type="number" step="0.01" defaultValue={phone?.screenSizeIn ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Tipo tela</label><input name="screen_type" defaultValue={phone?.screenType ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Resolução</label><input name="screen_resolution" defaultValue={phone?.screenResolution ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Hz</label><input name="display_hz" type="number" defaultValue={phone?.displayHz ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Brilho nits</label><input name="brightness_nits" type="number" defaultValue={phone?.brightnessNits ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Câmera principal MP</label><input name="main_camera_mp" type="number" defaultValue={phone?.mainCameraMp ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Ultrawide MP</label><input name="ultrawide_camera_mp" type="number" defaultValue={phone?.ultrawideCameraMp ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Telefoto MP</label><input name="telephoto_camera_mp" type="number" defaultValue={phone?.telephotoCameraMp ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Frontal MP</label><input name="selfie_camera_mp" type="number" defaultValue={phone?.selfieCameraMp ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Sensor</label><input name="camera_sensor" defaultValue={phone?.cameraSensor ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Zoom óptico</label><input name="optical_zoom" defaultValue={phone?.opticalZoom ?? ""} /></div>
        <div className={tab === "Tela/Câmera" ? "field" : "hidden-field"}><label>Vídeo</label><input name="video" defaultValue={phone?.video ?? ""} /></div>
        <label className={tab === "Tela/Câmera" ? "checkbox-line" : "hidden-field"}><input name="has_ois" type="checkbox" defaultChecked={phone?.hasOis ?? false} /> OIS</label>

        {[
          ["battery_mah", "Bateria mAh", phone?.batteryMah], ["charging_w", "Carregamento W", phone?.chargingW], ["wireless_charging_w", "Carregamento sem fio W", phone?.wirelessChargingW], ["height_mm", "Altura mm", phone?.heightMm], ["width_mm", "Largura mm", phone?.widthMm], ["thickness_mm", "Espessura mm", phone?.thicknessMm], ["weight_g", "Peso g", phone?.weightG]
        ].map(([nameAttr, label, value]) => <div className={tab === "Extras" ? "field" : "hidden-field"} key={String(nameAttr)}><label>{label}</label><input name={String(nameAttr)} type="number" step="0.01" defaultValue={value ?? ""} /></div>)}
        {[
          ["water_resistance", "Resistência", phone?.waterResistance], ["protection", "Proteção", phone?.protection], ["usb_type", "USB", phone?.usbType], ["wifi", "Wi-Fi", phone?.wifi], ["bluetooth", "Bluetooth", phone?.bluetooth], ["gps", "GPS", phone?.gps], ["biometric_type", "Biometria", phone?.biometricType], ["update_promise", "Promessa de updates", phone?.updatePromise]
        ].map(([nameAttr, label, value]) => <div className={tab === "Extras" ? "field" : "hidden-field"} key={String(nameAttr)}><label>{label}</label><input name={String(nameAttr)} defaultValue={String(value ?? "")} /></div>)}
        <div className={tab === "Extras" ? "field full" : "hidden-field"}><label>Bandas</label><textarea name="network_bands" defaultValue={phone?.networkBands ?? ""} /></div>
        <div className={tab === "Extras" ? "field full" : "hidden-field"}><label>Recursos</label><div className="checkbox-grid">{[["five_g","5G",phone?.fiveG ?? true],["nfc","NFC",phone?.nfc ?? true],["dual_sim","Dual SIM",phone?.dualSim ?? true],["esim","eSIM",phone?.esim ?? false],["memory_card","Cartão",phone?.memoryCard ?? false],["stereo_speakers","Som stereo",phone?.stereoSpeakers ?? true],["audio_jack","P2",phone?.audioJack ?? false],["reverse_charging","Carga reversa",phone?.reverseCharging ?? false]].map(([n,l,v]) => <label className="checkbox-line" key={String(n)}><input name={String(n)} type="checkbox" defaultChecked={Boolean(v)} /> {l}</label>)}</div></div>

        {[["short_review","Resumo curto",phone?.shortReview],["recommended_for","Indicado para",phone?.recommendedFor],["not_recommended_for","Não indicado para",phone?.notRecommendedFor],["alternatives","Alternativas",phone?.alternatives],["verdict","Veredito",phone?.verdict],["pros","Prós",phone?.pros],["cons","Contras",phone?.cons]].map(([n,l,v]) => <div className={tab === "Editorial" ? "field full" : "hidden-field"} key={String(n)}><label>{l}</label><textarea name={String(n)} defaultValue={String(v ?? "")} /></div>)}

        {[["score_performance","Nota desempenho",phone?.scorePerformance],["score_camera","Nota câmera",phone?.scoreCamera],["score_battery","Nota bateria",phone?.scoreBattery],["score_display","Nota tela",phone?.scoreDisplay],["score_build","Nota construção",phone?.scoreBuild],["score_value","Nota custo-benefício",phone?.scoreValue]].map(([n,l,v]) => <div className={tab === "Notas" ? "field" : "hidden-field"} key={String(n)}><label>{l}</label><input name={String(n)} type="number" step="0.1" min="0" max="10" defaultValue={v ?? ""} /></div>)}
      </div>
      <div className="form-actions">
        <button className="button" disabled={pending} type="submit">{pending ? "Salvando..." : "Salvar celular"}</button>
        {state.message ? <span className={state.ok ? "winner" : "muted"}>{state.message}</span> : null}
      </div>
    </form>
  );
}
