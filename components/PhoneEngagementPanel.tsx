"use client";

import { useActionState } from "react";
import { createPriceAlertAction, createReviewAction, savePhoneListAction } from "@/app/celulares/[slug]/actions";
import type { Phone } from "@/lib/types";
import { formatCurrency } from "@/lib/scoring";

const initialState = { ok: false, message: "" };

export function PhoneEngagementPanel({ phone }: { phone: Phone }) {
  const [alertState, alertAction, alertPending] = useActionState(createPriceAlertAction, initialState);
  const [listState, listAction, listPending] = useActionState(savePhoneListAction, initialState);
  const [reviewState, reviewAction, reviewPending] = useActionState(createReviewAction, initialState);

  return (
    <div className="engagement-panel" id="engajamento">
      <div className="engagement-intro">
        <span className="badge">Comunidade</span>
        <h2>Salve, monitore e avalie o {phone.name}</h2>
        <p className="muted">Recursos no estilo Kimovil: quero comprar, tenho/tive, alerta de preco e opinioes reais.</p>
      </div>

      <div className="engagement-grid">
        <form action={listAction} className="mini-form">
          <input name="phone_id" type="hidden" value={phone.id} />
          <label>Contato opcional</label>
          <input name="contact" placeholder="E-mail ou WhatsApp" />
          <div className="segmented-actions">
            <button disabled={listPending} name="status" type="submit" value="want">Quero</button>
            <button disabled={listPending} name="status" type="submit" value="have">Tenho</button>
            <button disabled={listPending} name="status" type="submit" value="had">Ja tive</button>
          </div>
          {listState.message ? <p className={listState.ok ? "success-text" : "error-text"}>{listState.message}</p> : null}
        </form>

        <form action={alertAction} className="mini-form">
          <input name="phone_id" type="hidden" value={phone.id} />
          <label>Alerta de preco</label>
          <input name="target_price" placeholder={`Ex.: ${Math.max(1, Math.round(phone.bestPrice * 0.9))}`} type="number" />
          <input name="contact" placeholder="E-mail ou WhatsApp" />
          <button className="button" disabled={alertPending} type="submit">Avisar quando baixar</button>
          <small className="muted">Preco atual de referencia: {formatCurrency(phone.bestPrice)}</small>
          {alertState.message ? <p className={alertState.ok ? "success-text" : "error-text"}>{alertState.message}</p> : null}
        </form>

        <form action={reviewAction} className="review-form">
          <input name="phone_id" type="hidden" value={phone.id} />
          <input name="phone_slug" type="hidden" value={phone.slug} />
          <div className="form-grid compact">
            <label>Nota<input max="10" min="1" name="rating" placeholder="8.5" step="0.1" type="number" /></label>
            <label>Voce<input name="owned_status" placeholder="tem, teve ou testou" /></label>
            <label>Contato<input name="contact" placeholder="Nome, email ou WhatsApp" /></label>
          </div>
          <div className="form-grid compact">
            <label>Pontos positivos<input name="pros" placeholder="Bateria, tela, cameras..." /></label>
            <label>Pontos negativos<input name="cons" placeholder="Peso, preco, aquecimento..." /></label>
          </div>
          <label>Opiniao<textarea name="comment" placeholder="Conte como foi sua experiencia com esse aparelho." rows={4} /></label>
          <button className="button" disabled={reviewPending} type="submit">Enviar opiniao</button>
          {reviewState.message ? <p className={reviewState.ok ? "success-text" : "error-text"}>{reviewState.message}</p> : null}
        </form>
      </div>
    </div>
  );
}
