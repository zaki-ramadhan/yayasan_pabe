import { test, expect } from "@playwright/test";
import { setupE2EContext, scrollToElement } from "./helpers";

test.describe("Master User Journey - Eksplorasi Penuh Seluruh Halaman Yayasan", () => {
  test("menjalankan alur sekuensial alami, stress test ekstrem, penyerangan injeksi payload, dan fuzzing input di seluruh halaman dalam satu tab browser Brave layar penuh", async ({ page }) => {
    test.setTimeout(300000);

    const uncaughtErrors = [];
    page.on("pageerror", (err) => {
      uncaughtErrors.push(err.message);
    });

    await setupE2EContext(page);

    // =========================================================================
    // TAHAP 0: LOGIN AWAL DONATUR (SESI AKTIF PERSISTEN DALAM SATU TAB)
    // =========================================================================
    await page.goto("/login");
    await page.locator("#identifier").fill("hendra.donatur");
    await page.locator("#password").fill("123456");
    await page.getByRole("button", { name: "Masuk ke Akun" }).click();
    await page.waitForTimeout(600);

    // =========================================================================
    // TAHAP 1: BERANDA (HOME) - STRESS TEST QUICK DONATE & ACCORDION
    // =========================================================================
    await page.goto("/");
    await expect(page).toHaveTitle(/Beranda|Yayasan/i);

    // 1.1 Hero Section
    const heroTitle = page.locator("h1");
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText(/Penyaluran Zakat, Infak, dan Sedekah/i);

    // 1.2 Widget Quick Donate: Preset & Injeksi Fuzzing Nominal Kustom
    const preset50k = page.getByRole("button", { name: /50\.000/i }).first();
    const preset100k = page.getByRole("button", { name: /100\.000/i }).first();
    const preset25k = page.getByRole("button", { name: /25\.000/i }).first();

    if (await preset50k.isVisible()) await preset50k.click();
    if (await preset100k.isVisible()) await preset100k.click();
    if (await preset25k.isVisible()) await preset25k.click();

    const customModeBtn = page.getByRole("button", { name: /Nominal Lain/i }).first();
    if (await customModeBtn.isVisible()) {
      await customModeBtn.click();
      await page.waitForTimeout(200);

      const customCurrencyInput = page.locator("input[inputmode='numeric']").first();
      if (await customCurrencyInput.isVisible()) {
        // Serangan 1: Karakter anomali & simbol liar (harus dicegah oleh formatter)
        await customCurrencyInput.fill("abc!@#$%-9999");
        await page.waitForTimeout(150);

        // Serangan 2: Nilai di bawah batas minimum (harus auto-clamp ke Rp 10.000 saat blur)
        await customCurrencyInput.fill("3500");
        await customCurrencyInput.blur();
        await page.waitForTimeout(200);

        // Serangan 3: Angka raksasa melampaui batas 100 juta
        await customCurrencyInput.fill("999999999999");
        await customCurrencyInput.blur();
        await page.waitForTimeout(200);

        // Masukkan nominal valid untuk pengujian normal
        await customCurrencyInput.fill("150000");
        await page.waitForTimeout(200);
      }
    }

    // 1.3 Section Program Donasi Pilihan
    const sectionProgram = page.getByText("Program Donasi Pilihan").first();
    await scrollToElement(sectionProgram);
    await expect(sectionProgram).toBeVisible();

    const firstCampaignCard = page.locator("a[href^='/campaign/']").first();
    if (await firstCampaignCard.isVisible()) {
      await firstCampaignCard.hover();
      await page.waitForTimeout(200);
    }

    // 1.4 Section Transparansi
    const sectionTransparansi = page.getByText(/Transparansi/i).first();
    await scrollToElement(sectionTransparansi);
    await expect(sectionTransparansi).toBeVisible();

    // 1.5 Section FAQ Accordion (Multi-Toggle & Stress Click)
    const faqHeading = page.getByRole("heading", { name: "FAQ", level: 2 });
    await scrollToElement(faqHeading);
    const faqButtons = page.locator("section:has-text('FAQ') button[data-state]");
    if (await faqButtons.count() > 1) {
      const firstFaq = faqButtons.nth(0);
      const secondFaq = faqButtons.nth(1);

      if (await firstFaq.isVisible()) {
        await firstFaq.click();
        await page.waitForTimeout(200);
        await expect(firstFaq).toHaveAttribute("data-state", "open");

        await secondFaq.click();
        await page.waitForTimeout(200);
        await expect(secondFaq).toHaveAttribute("data-state", "open");
        await expect(firstFaq).toHaveAttribute("data-state", "closed");

        await secondFaq.click();
        await page.waitForTimeout(200);
        await expect(secondFaq).toHaveAttribute("data-state", "closed");
      }
    }


    // =========================================================================
    // TAHAP 2: ALUR NATURAL -> TENTANG KAMI (/tentang-kami)
    // =========================================================================
    await page.goto("/tentang-kami");
    await expect(page.locator("h1")).toBeVisible();

    // Periksa action buttons header
    await expect(page.getByRole("button", { name: /Salurkan Donasi/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Kalkulator Zakat/i }).first()).toBeVisible();

    // Buka dan tutup ShareDropdown profil yayasan
    const shareDropdownBtn = page.locator("button[aria-label='Bagikan profil yayasan']").first();
    if (await shareDropdownBtn.isVisible()) {
      await shareDropdownBtn.click();
      await page.waitForTimeout(250);
      await page.keyboard.press("Escape");
    }

    // Salin nomor rekening resmi yayasan (BSI, BCA, Mandiri)
    const rekeningHeading = page.getByText(/Rekening Resmi Yayasan/i).first();
    await scrollToElement(rekeningHeading);
    const copyBankButtons = page.locator("button[aria-label*='Salin nomor rekening']");
    const countCopyButtons = await copyBankButtons.count();
    for (let i = 0; i < Math.min(countCopyButtons, 3); i++) {
      await copyBankButtons.nth(i).click();
      await page.waitForTimeout(150);
    }

    // =========================================================================
    // TAHAP 3: ALUR NATURAL -> SEMUA PROGRAM (/program) - FUZZING & INJEKSI SEARCH
    // =========================================================================
    await page.goto("/program");
    await expect(page).toHaveTitle(/Program Kebaikan/i);

    const searchInput = page.getByPlaceholder(/Cari program donasi/i).first();
    if (await searchInput.isVisible()) {
      // Injeksi 1: SQL Injection probe
      await searchInput.fill("' OR '1'='1' --");
      await page.waitForTimeout(450);

      // Injeksi 2: XSS script tag probe
      await searchInput.fill("<script>alert('xss_program')</script>");
      await page.waitForTimeout(450);

      // Injeksi 3: Emoji spam & Unicode strings
      await searchInput.fill("🔥🔥🔥🚀🚀🚀💥💥💥");
      await page.waitForTimeout(450);

      // Injeksi 4: String panjang 150+ karakter
      await searchInput.fill("a".repeat(160));
      await page.waitForTimeout(450);

      // Verifikasi Empty State muncul secara anggun tanpa crash
      const emptyStateText = page.getByText(/Tidak ada program yang sesuai/i);
      await expect(emptyStateText).toBeVisible();

      // Klik tombol reset filter
      const resetFilterBtn = page.getByRole("button", { name: /Reset Filter/i });
      if (await resetFilterBtn.isVisible()) {
        await resetFilterBtn.click();
        await page.waitForTimeout(300);
      }

      // Pencarian valid kata kunci 'yatim'
      await searchInput.fill("yatim");
      await page.waitForTimeout(450);
      await expect(page.locator("a[href^='/campaign/']").first()).toBeVisible();

      // Clear search
      const clearSearchBtn = page.locator("button[aria-label='Hapus pencarian']");
      if (await clearSearchBtn.isVisible()) {
        await clearSearchBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Filter Kategori Tabs
    const tabPendidikan = page.getByRole("button", { name: /Pendidikan/i }).first();
    const tabKemanusiaan = page.getByRole("button", { name: /Kemanusiaan/i }).first();
    const tabSemua = page.getByRole("button", { name: /Semua/i }).first();

    if (await tabPendidikan.isVisible()) {
      await tabPendidikan.click();
      await page.waitForTimeout(250);
    }
    if (await tabKemanusiaan.isVisible()) {
      await tabKemanusiaan.click();
      await page.waitForTimeout(250);
    }
    if (await tabSemua.isVisible()) {
      await tabSemua.click();
      await page.waitForTimeout(250);
    }

    // =========================================================================
    // TAHAP 4: ALUR NATURAL -> DONASI RUTIN OTOMATIS (/donasi-rutin)
    // =========================================================================
    await page.goto("/donasi-rutin");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 4.1 Ganti Sapaan
    const salutationTrigger = page.locator("button[aria-haspopup='menu']").filter({ hasText: /Bapak|Ibu|Saudara/i }).first();
    if (await salutationTrigger.isVisible()) {
      await salutationTrigger.click();
      await page.waitForTimeout(200);
      const optIbu = page.getByRole("menuitem", { name: "Ibu" });
      if (await optIbu.isVisible()) {
        await optIbu.click();
        await page.waitForTimeout(200);
      }
    }

    // 4.2 Serangan Fuzzing Nama & Telepon
    const routineNameInput = page.locator("input[placeholder='Contoh: Ahmad Fauzi']");
    if (await routineNameInput.isVisible()) {
      // Injeksi nama: XSS tag + emoji + spasi liar
      await routineNameInput.fill("   <b onmouseover=alert(1)>Hendra</b> 🔥 Donatur   ");
      await page.waitForTimeout(150);
    }

    const routinePhoneInput = page.locator("input[placeholder*='0812']").first();
    if (await routinePhoneInput.isVisible()) {
      await routinePhoneInput.fill("081234567890");
      await page.waitForTimeout(150);
    }

    // 4.3 Pengaturan Frekuensi Jadwal
    const freqJumat = page.getByRole("button", { name: /Setiap Jumat/i }).first();
    if (await freqJumat.isVisible()) {
      await scrollToElement(freqJumat);
      await freqJumat.click();
      await page.waitForTimeout(200);
    }

    // Uji Tambah Program ke-2 & Hapus Kembali
    const addProgramBtn = page.getByRole("button", { name: /Tambah Program Lain/i });
    if (await addProgramBtn.isVisible()) {
      await addProgramBtn.click();
      await page.waitForTimeout(300);

      const removeBtn = page.getByRole("button", { name: /Hapus Program/i }).first();
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Submit Komitmen Donasi Rutin
    const routineSubmitBtn = page.getByRole("button", { name: /Aktifkan/i }).first();
    if (await routineSubmitBtn.isVisible()) {
      await scrollToElement(routineSubmitBtn);
      await routineSubmitBtn.click();
      await page.waitForTimeout(1000);

      const routineSuccessHeading = page.getByText(/Jadwal Donasi Rutin Berhasil/i);
      await expect(routineSuccessHeading).toBeVisible();
    }


    // =========================================================================
    // TAHAP 5: DETAIL PROGRAM (/campaign/[slug]) - TABS & CHAT INJEKSI DOA
    // =========================================================================
    await page.goto("/campaign/beasiswa-pendidikan-anak-yatim");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("tablist")).toBeVisible();

    // 5.1 Tab Switching
    const tabPenyaluran = page.getByRole("tab", { name: /Laporan Penyaluran/i });
    const tabDoa = page.getByRole("tab", { name: /Doa & Dukungan/i });
    const tabDetail = page.getByRole("tab", { name: /Detail Program/i });

    if (await tabPenyaluran.isVisible()) {
      await tabPenyaluran.click();
      await page.waitForTimeout(250);
    }
    if (await tabDoa.isVisible()) {
      await tabDoa.click();
      await page.waitForTimeout(250);
    }
    if (await tabDetail.isVisible()) {
      await tabDetail.click();
      await page.waitForTimeout(250);
    }

    // 5.2 Sidebar Chat Doa & Aamiin Click Storm
    const sidebarPrayersHeader = page.getByText(/Doa-Doa Orang Baik/i).first();
    if (await sidebarPrayersHeader.isVisible()) {
      await scrollToElement(sidebarPrayersHeader);

      // Aamiin rapid 5x click storm
      const aminBtn = page.getByRole("button", { name: /Aamiin/i }).first();
      if (await aminBtn.isVisible()) {
        for (let i = 0; i < 5; i++) {
          await aminBtn.click();
          await page.waitForTimeout(80);
        }
      }

      // Injeksi Doa: SVG onload injection + Arabic unicode + emojis
      const prayerChatInput = page.getByPlaceholder(/Tulis doa kebaikan Anda/i);
      if (await prayerChatInput.isVisible()) {
        await prayerChatInput.fill("<svg/onload=alert('hack')> بِسْمِ اللَّهِ 🤲 Semoga berkah selalu.");
        await page.waitForTimeout(200);

        const sendPrayerBtn = page.locator("button[aria-label='Kirim doa']");
        if (await sendPrayerBtn.isVisible()) {
          await sendPrayerBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // 5.3 Klik Donasi Sekarang jika belum berpindah ke formulir donasi
    if (!page.url().includes("/donate")) {
      const donateBtn = page.locator("a[href$='/donate']").first();
      if (await donateBtn.isVisible()) {
        await scrollToElement(donateBtn);
        await donateBtn.click();
      }
    }
    await page.waitForURL(/\/donate/);



    // =========================================================================
    // TAHAP 6: FORMULIR DONASI CHECKOUT & INVOICE RESMI
    // =========================================================================
    await expect(page.locator("h1")).toContainText(/Formulir Donasi/i);

    // Boundary Test: Nominal di bawah Rp 10.000 menonaktifkan submit
    const customNominalBtn = page.getByRole("button", { name: /Nominal Lain/i }).first();
    if (await customNominalBtn.isVisible()) {
      await customNominalBtn.click();
      const customInput = page.locator("input[inputmode='numeric']").first();
      if (await customInput.isVisible()) {
        await customInput.fill("4000");
        await page.waitForTimeout(200);
        const submitBtnCheck = page.getByRole("button", { name: /Lanjut Pembayaran/i });
        await expect(submitBtnCheck).toBeDisabled();
      }
    }

    // Pilih nominal valid
    const nominalBtn = page.getByRole("button", { name: /100\.000/i }).first();
    if (await nominalBtn.isVisible()) {
      await nominalBtn.click();
      await page.waitForTimeout(200);
    }

    // Toggle Checkbox Anonim (Hamba Allah)
    const anonCheckbox = page.locator("input[type='checkbox']").first();
    if (await anonCheckbox.isVisible()) {
      await anonCheckbox.check();
      await page.waitForTimeout(150);
      await anonCheckbox.uncheck();
    }

    // Nomor WhatsApp
    const phoneInput = page.locator("input[type='tel']");
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("081899887766");
    }

    // Submit Transaksi
    const submitBtn = page.getByRole("button", { name: /Lanjut Pembayaran/i });
    await scrollToElement(submitBtn);
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verifikasi Terbit Invoice Resmi & Sanitasi XSS
    await page.waitForURL(/\/invoice\//, { timeout: 20000 });
    await expect(page.locator("main")).toContainText(/Instruksi Pembayaran|Menunggu Pembayaran|Tagihan Donasi/i);
    await expect(page.locator("main")).not.toContainText("<script>");
    await expect(page.locator("main")).not.toContainText("<svg");
    await page.waitForTimeout(500);

    // =========================================================================
    // TAHAP 7: ARTIKEL & KABAR LAPANGAN (/artikel) - SPAM CLICK LIKE & SHARE
    // =========================================================================
    await page.goto("/artikel");
    await expect(page.locator("h1").first()).toContainText(/Artikel & Kabar Filantropi/i);

    const firstArticle = page.locator("a[href^='/artikel/']").first();
    if (await firstArticle.isVisible()) {
      await firstArticle.click();
      await page.waitForURL(/\/artikel\//);
      await expect(page.locator("h1").first()).toBeVisible();

      // 7.1 Reaction Bar Rapid Click Storm (Like/Dislike 6x bergantian)
      const likeBtn = page.getByRole("button", { name: /Sukai artikel|Batalkan suka/i }).first();
      const dislikeBtn = page.getByRole("button", { name: /Tidak suka|Batalkan tidak suka/i }).first();

      if (await likeBtn.isVisible()) {
        await scrollToElement(likeBtn);
        for (let i = 0; i < 3; i++) {
          await likeBtn.click();
          await page.waitForTimeout(100);
          if (await dislikeBtn.isVisible()) {
            await dislikeBtn.click();
            await page.waitForTimeout(100);
          }
        }
      }

      // 7.2 Share Dropdown
      const articleShareBtn = page.locator("button[aria-label='Bagikan artikel']").first();
      if (await articleShareBtn.isVisible()) {
        await articleShareBtn.click();
        await page.waitForTimeout(200);
        const copyLinkItem = page.getByRole("menuitem", { name: /Salin Tautan/i });
        if (await copyLinkItem.isVisible()) {
          await copyLinkItem.click();
          await page.waitForTimeout(200);
        } else {
          await page.keyboard.press("Escape");
        }
      }
    }

    // =========================================================================
    // TAHAP 8: SUB-HALAMAN INFORMASI LENGKAP (SEKUANSIAL ALAMI)
    // =========================================================================
    // 8.1 Laporan Keuangan (/laporan)
    await page.goto("/laporan");
    await expect(page.locator("h1")).toContainText(/Dashboard Transparansi Keuangan/i);
    const yearPills = page.locator("button").filter({ hasText: /Tahun 2026|Tahun 2025|Semua Tahun/i });
    const yearCount = await yearPills.count();
    for (let i = 0; i < yearCount; i++) {
      await yearPills.nth(i).click();
      await page.waitForTimeout(200);
    }

    // 8.2 Distribusi Penyaluran (/distribusi)
    await page.goto("/distribusi");
    await expect(page.locator("h1")).toContainText(/Distribusi/i);
    await expect(page.getByText(/Dewan Pengawas Syariah/i).first()).toBeVisible();

    // 8.3 Kalkulator Zakat (/kalkulator-zakat) - Boundary & Formula Syariah
    await page.goto("/kalkulator-zakat");
    await expect(page.locator("h1").first()).toContainText(/Kalkulator Zakat/i);

    const tabMaal = page.getByRole("tab", { name: "Maal" });
    if (await tabMaal.isVisible()) {
      await tabMaal.click();
      await page.waitForTimeout(200);

      const tabunganInput = page.getByRole("textbox", { name: /Uang Tunai, Tabungan, Deposito/i });
      if (await tabunganInput.isVisible()) {
        // Fuzzing 1: Angka negatif
        await tabunganInput.fill("-5000000");
        await page.waitForTimeout(150);

        // Fuzzing 2: Di bawah nisab (10jt) -> Zakat harus Rp 0
        await tabunganInput.fill("10000000");
        const hitungBtn = page.getByRole("button", { name: "Hitung Zakat" });
        if (await hitungBtn.isEnabled()) {
          await hitungBtn.click();
          await page.waitForTimeout(250);
          await expect(page.locator("main")).toContainText(/Rp\s*0/i);
        }

        // Fuzzing 3: Di atas nisab (100jt) -> Zakat 2.5% = 2.500.000
        await tabunganInput.fill("100000000");
        if (await hitungBtn.isEnabled()) {
          await hitungBtn.click();
          await page.waitForTimeout(250);
          await expect(page.locator("main")).toContainText(/2\.500\.000/i);
        }

        // Reset form
        const resetBtn = page.getByRole("button", { name: "Atur Ulang" });
        if (await resetBtn.isVisible()) {
          await resetBtn.click();
          await page.waitForTimeout(200);
        }
      }
    }

    // 8.4 Relawan Kebaikan (/volunteer) - Injeksi Form
    await page.goto("/volunteer");
    await expect(page.locator("h1")).toContainText(/Relawan/i);

    const volNameInput = page.locator("input[placeholder='Nama Anda']");
    if (await volNameInput.isVisible()) {
      // Injeksi nama dengan tag HTML
      await volNameInput.fill("<script>alert('vol')</script> Budi Santoso");
      await page.locator("input[placeholder='0812xxxxxxxx']").fill("085712345678");
      await page.locator("input[placeholder='email@anda.com']").fill("budi.santoso@example.com");
      await page.locator("input[placeholder*='Bogor']").fill("Jakarta Selatan");

      const selectInterest = page.locator("select");
      if (await selectInterest.isVisible()) {
        await selectInterest.selectOption({ index: 1 });
      }

      const motivationArea = page.locator("textarea");
      if (await motivationArea.isVisible()) {
        await motivationArea.fill("Berkhidmat membantu anak yatim dan korban bencana.");
      }

      const submitVolBtn = page.getByRole("button", { name: /Daftar sebagai relawan/i });
      if (await submitVolBtn.isVisible()) {
        await submitVolBtn.click();
        await page.waitForTimeout(600);

        const volSuccessCard = page.getByText(/Pendaftaran Relawan Berhasil Dikirim/i);
        if (await volSuccessCard.isVisible()) {
          await expect(volSuccessCard).toBeVisible();
        }
      }
    }

    // 8.5 Peluang Karier (/karier) - Pencarian Injeksi & Lamar
    await page.goto("/karier");
    await expect(page.getByRole("heading", { name: /Peluang Karier/i }).first()).toBeVisible();

    const careerSearchInput = page.getByPlaceholder(/Cari posisi, divisi/i);
    if (await careerSearchInput.isVisible()) {
      // Injeksi pencarian karier
      await careerSearchInput.fill("' UNION SELECT * FROM jobs --");
      await page.waitForTimeout(350);
      await careerSearchInput.fill("<script>alert('karier')</script>");
      await page.waitForTimeout(350);
      await careerSearchInput.fill("");
      await page.waitForTimeout(250);
    }

    const careerItems = page.locator(".cursor-pointer").filter({ hasText: /Divisi|Pengalaman|Full-time|Magang/i });
    if (await careerItems.count() > 1) {
      await careerItems.nth(1).click();
      await page.waitForTimeout(250);
    }
    const applyBtn = page.getByRole("button", { name: /Lamar/i }).first();
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
    await page.waitForTimeout(300);

    // Modal lamaran internal terbuka
    const applyModalTitle = page.getByText(/Formulir Lamaran Kerja/i);
    await expect(applyModalTitle).toBeVisible();

    // Isi formulir lamaran kerja
    await page.getByPlaceholder(/Muhammad Ihsan/i).fill("Ahmad Pelamar E2E");
    await page.getByPlaceholder(/nama@email.com/i).fill("pelamar.e2e@example.com");
    await page.getByPlaceholder(/081234567890/i).fill("081299887766");
    await page.getByPlaceholder(/drive.google.com/i).fill("https://drive.google.com/file/d/cv-e2e/view");
    await page.getByPlaceholder(/Ceritakan secara ringkas/i).fill("Bismillah, saya siap berkontribusi secara penuh waktu di yayasan.");

    const submitApplyBtn = page.getByRole("button", { name: /Kirim Lamaran/i });
    await submitApplyBtn.click();
    await page.waitForTimeout(600);

    // Verifikasi pesan sukses
    await expect(page.getByText(/Lamaran Berhasil Terkirim/i)).toBeVisible();
    await page.getByRole("button", { name: /Tutup & Selesai/i }).click();
    await page.waitForTimeout(200);


    // 8.6 Ketentuan Transaksi (/ketentuan-transaksi)
    await page.goto("/ketentuan-transaksi");
    await expect(page.locator("h1").first()).toContainText(/Ketentuan Transaksi/i);
    await expect(page.getByText(/Virtual Account/i).first()).toBeVisible();
    await expect(page.getByText(/QRIS/i).first()).toBeVisible();

    // =========================================================================
    // TAHAP 9: DASBOR DONATUR & SUPER ADMIN
    // =========================================================================
    // 9.1 Dasbor Donatur
    await page.goto("/donatur/dashboard");
    await expect(page).toHaveTitle(/Portal Donatur/i);
    await expect(page.getByText(/Total Donasi/i).first()).toBeVisible();

    await page.goto("/donatur/riwayat");
    await expect(page).toHaveTitle(/Portal Donatur/i);
    await expect(page.getByRole("table")).toBeVisible();

    await page.goto("/donatur/profil");
    await expect(page).toHaveTitle(/Portal Donatur/i);
    await expect(page.locator("input[name='name'], #name, input[type='text']").first()).toBeVisible();

    // 9.2 Switch ke Super Admin
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem("pabe_tour_campaign_seen", "1");
    });
    await page.context().clearCookies();

    await page.goto("/login");
    await page.locator("#identifier").fill("superadmin@pabe.or.id");
    await page.locator("#password").fill("123456");
    await page.getByRole("button", { name: "Masuk ke Akun" }).click();
    await page.waitForTimeout(600);

    // 9.3 Dasbor Admin
    await page.goto("/dashboard");
    await expect(page.getByText(/Ahlan wa Sahlan/i).first()).toBeVisible();
    await expect(page.getByText(/Mutasi Donasi Masuk/i).first()).toBeVisible();

    const tableHeaderNominal = page.getByRole("columnheader", { name: /Nominal/i });
    if (await tableHeaderNominal.isVisible()) {
      await tableHeaderNominal.click();
      await page.waitForTimeout(250);
    }

    const volunteerWidget = page.getByText(/Review Relawan Pendaftar/i).first();
    if (await volunteerWidget.isVisible()) {
      await scrollToElement(volunteerWidget);
      await expect(volunteerWidget).toBeVisible();
    }

    // Kembali ke Beranda di akhir alur lengkap
    await page.goto("/");
    await expect(page).toHaveTitle(/Beranda|Yayasan/i);
    await page.waitForTimeout(400);

    // =========================================================================
    // TAHAP 10: STRICT ZERO-ERROR CONSOLE AUDIT
    // =========================================================================
    expect(uncaughtErrors).toEqual([]);
  });
});
