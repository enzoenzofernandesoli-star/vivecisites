"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().trim().min(2, "Como posso chamar você?").max(80),
  whatsapp: z.string().trim().min(8, "Digite um WhatsApp válido.").max(24).regex(/^[+\d\s()-]+$/, "Digite um WhatsApp válido."),
  business: z.string().trim().min(2, "Qual é o nome da empresa?").max(120),
  links: z.string().trim().max(240, "Use no máximo 240 caracteres.").optional(),
  website: z.string().max(0).optional(),
});
type FormData = z.infer<typeof formSchema>;
export function ContactForm(){
  const [status,setStatus]=useState("");
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormData>({resolver:zodResolver(formSchema),defaultValues:{links:"",website:""}});
  const submit=async(data:FormData)=>{setStatus("");try{const r=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const json=await r.json();if(!r.ok)throw new Error(json.error);const destination=new URL(json.whatsappUrl);if(destination.protocol!=="https:"||destination.hostname!=="wa.me")throw new Error("Não consegui abrir o WhatsApp. Tente novamente.");setStatus("Abrindo o WhatsApp...");window.location.assign(destination.toString());}catch(e){setStatus(e instanceof Error?e.message:"Não consegui abrir o WhatsApp. Tente novamente.");}};
  return <form onSubmit={handleSubmit(submit)} className="contact-form" noValidate><div className="form-intro"><h3>VEJA UMA IDEIA ANTES DE DECIDIR</h3><p>Preencha o essencial. Ao continuar, sua conversa com a Viveci já abre no WhatsApp com a mensagem pronta.</p></div>
    <div className="form-grid"><label>Nome *<input {...register("name")} autoComplete="name" required />{errors.name&&<small>{errors.name.message}</small>}</label><label>WhatsApp *<input {...register("whatsapp")} type="tel" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" required/>{errors.whatsapp&&<small>{errors.whatsapp.message}</small>}</label></div>
    <div className="form-grid"><label>Nome da empresa *<input {...register("business")} autoComplete="organization" required />{errors.business&&<small>{errors.business.message}</small>}</label><label>Instagram ou site atual <span>(opcional)</span><input {...register("links")} inputMode="url" autoComplete="url" placeholder="@empresa ou seusite.com.br"/>{errors.links&&<small>{errors.links.message}</small>}</label></div>
    <label className="honey" aria-hidden="true">Website<input {...register("website")} tabIndex={-1} autoComplete="off"/></label>
    <div className="form-submit"><button type="submit" className="button button-light" disabled={isSubmitting}>{isSubmitting?"ABRINDO WHATSAPP...":"QUERO VER MEU SITE"}</button><p role="status" aria-live="polite">{status||"Sem custo e sem compromisso. Seus dados serão usados somente para iniciar este atendimento."}</p></div>
  </form>;
}
