import { FileText, Camera, Zap, Shield, ArrowRight, CheckCircle, Layers, Brain, Globe, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { PwaShareButton } from "@/components/pwa/pwa-share-button";
import { LanguageSelector } from "@/components/layout/language-selector";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Landing");
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header — Navegação completa para sitelinks do Google */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PDFfULL
          </Link>
          <nav className="hidden md:flex gap-6 items-center text-sm">
            <Link href="/sobre" className="text-muted-foreground hover:text-blue-600 transition-colors">
              {t("navAbout")}
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:text-blue-600 transition-colors">
              {t("navFaq")}
            </Link>
            <Link href="/converter" className="text-muted-foreground hover:text-blue-600 transition-colors">
              {t("navConverter")}
            </Link>
            <Link href="/leitor" className="text-muted-foreground hover:text-blue-600 transition-colors">
              {t("navReader")}
            </Link>
            <LanguageSelector />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("navLogin")}
              </Button>
            </Link>
            <Link href="/converter">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                {t("navConvertNow")}
              </Button>
            </Link>
          </nav>
          <nav className="flex md:hidden gap-2 items-center">
            <LanguageSelector />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("navLogin")}
              </Button>
            </Link>
            <Link href="/converter">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                {t("navConverter")}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="flex flex-col items-center justify-center gap-6 px-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100">
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-lg">
            {t("heroTitle")}
            <br />
            <span className="text-blue-600">{t("heroHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            {t("heroDescription")}
          </p>
          <Link href="/converter">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Camera className="h-5 w-5" />
              {t("ctaButton")}
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            {t("freeTrialNote")}
          </p>
          <div className="flex gap-2 mt-2">
            <PwaInstallButton />
            <PwaShareButton />
          </div>
        </section>

        {/* Como Funciona — 3 passos simples e objetivos */}
        <section className="border-t bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-4xl text-center mb-10">
            <h2 className="text-2xl font-bold">{t("howTitle")}</h2>
            <p className="text-muted-foreground mt-2">{t("howSubtitle")}</p>
          </div>
          <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold">{t("step1Title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("step1Desc")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold">{t("step2Title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("step2Desc")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold">{t("step3Title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("step3Desc")}
              </p>
            </div>
          </div>
          {/* CTA intermediário */}
          <div className="text-center mt-10">
            <Link href="/converter">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Camera className="h-5 w-5" />
                {t("tryFree")}
              </Button>
            </Link>
          </div>
        </section>

        {/* Funcionalidades */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center mb-10">
            <h2 className="text-2xl font-bold">{t("featuresTitle")}</h2>
          </div>
          <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Camera className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">{t("featureCamera")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("featureCameraDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Zap className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">{t("featureInstant")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("featureInstantDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Layers className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">{t("featureMultiPage")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("featureMultiPageDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Brain className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">{t("featureAi")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("featureAiDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">{t("featurePrivacy")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("featurePrivacyDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border p-5">
              <Globe className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">{t("featureLanguages")}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("featureLanguagesDesc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border-2 border-blue-100 bg-blue-50/50 p-5">
              <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">{t("featureReader")} <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full ml-1">{t("newBadge")}</span></h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("featureReaderDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="planos" className="border-t bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-2">{t("pricingTitle")}</h2>
            <p className="text-muted-foreground mb-8">{t("pricingSubtitle")}</p>
            <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="rounded-2xl border bg-white p-6 text-left">
                <h3 className="font-semibold text-lg">{t("pricingFree")}</h3>
                <p className="text-3xl font-bold mt-2">
                  {t("pricingFreePrice")}<span className="text-sm font-normal">{t("perMonth")}</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {t("pricingFree1")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {t("pricingFree2")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {t("pricingFree3")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {t("pricingFree4")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {t("pricingFree5")}</li>
                </ul>
                <Link href="/register" className="block mt-6">
                  <Button variant="outline" className="w-full">
                    {t("pricingFreeCta")}
                  </Button>
                </Link>
              </div>
              <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 text-left relative">
                <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  {t("pricingProPopular")}
                </span>
                <h3 className="font-semibold text-lg">{t("pricingPro")}</h3>
                <p className="text-3xl font-bold mt-2">
                  {t("pricingProPrice")}<span className="text-sm font-normal">{t("perMonth")}</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> {t("pricingPro1")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> {t("pricingPro2")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> {t("pricingPro3")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> {t("pricingPro4")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> {t("pricingPro5")}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> {t("pricingPro6")}</li>
                </ul>
                <Link href="/converter" className="block mt-6">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {t("pricingProCta")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Leitor de PDF */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border-2 border-blue-100 bg-linear-to-br from-blue-50 to-white p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 shrink-0">
                <BookOpen className="h-10 w-10 text-blue-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{t("readerSectionTitle")}</h2>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{t("newBadge")}</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  {t("readerSectionDesc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link href="/leitor">
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                      <BookOpen className="h-4 w-4" />
                      {t("readerSectionCta")}
                    </Button>
                  </Link>
                  <Link href="/leitor">
                    <Button variant="outline" className="gap-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      {t("readerSectionProCta")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">{t("finalCtaTitle")}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t("finalCtaDesc")}
          </p>
          <Link href="/converter">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              {t("finalCtaButton")}
            </Button>
          </Link>
        </section>

        {/* Contato */}
        <section className="border-t bg-gray-50 px-4 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-xl font-bold mb-2">{t("helpTitle")}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {t("helpDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/faq">
                <Button variant="outline" className="gap-2">
                  {t("helpFaq")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer expandido — sitelinks para SEO */}
      <footer className="border-t bg-white px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3 text-sm">
            <div>
              <p className="font-semibold text-blue-600 mb-3">PDFfULL</p>
              <p className="text-muted-foreground text-xs">
                {t("footerTagline")}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3">{t("footerNavTitle")}</p>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/converter" className="hover:text-blue-600 transition-colors">{t("footerConverter")}</Link>
                <Link href="/leitor" className="hover:text-blue-600 transition-colors">{t("footerReader")}</Link>
                <Link href="/sobre" className="hover:text-blue-600 transition-colors">{t("footerAbout")}</Link>
                <Link href="/faq" className="hover:text-blue-600 transition-colors">{t("footerFaq")}</Link>
              </nav>
            </div>
            <div>
              <p className="font-semibold mb-3">{t("footerLegalTitle")}</p>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/termos" className="hover:text-blue-600 transition-colors">{t("footerTerms")}</Link>
                <Link href="/privacidade" className="hover:text-blue-600 transition-colors">{t("footerPrivacy")}</Link>
                <a href="mailto:contato@pdffull.com.br" className="hover:text-blue-600 transition-colors">{t("footerContact")}</a>
              </nav>
            </div>
          </div>
          <div className="border-t mt-6 pt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} PDFfULL. {t("footerRights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
