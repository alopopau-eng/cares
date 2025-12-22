"use client"
import {
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Menu,
    MessageCircle,
    Lightbulb,
    Star,
    Shield,
    Users,
    CheckCircle,
    Heart,
  } from "lucide-react"
  import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
  
  export default function Page() {
  const router = useRouter()
const redirectToStart=()=>{
    router.replace('/home-new')
}
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Social Icons & Language */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <a href="#" className="text-[#1e5a7d] hover:text-[#2c7ba5] transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="text-[#1e5a7d] hover:text-[#2c7ba5] transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="text-[#1e5a7d] hover:text-[#2c7ba5] transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="text-[#1e5a7d] hover:text-[#2c7ba5] transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
  
         
              {/* Menu */}
              <button className="text-[#1e5a7d]">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>
  
        {/* Hero Section */}
        <section className="relative h-[500px] bg-gradient-to-b from-[#1e5a7d] to-[#2c7ba5] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/bg.svg')] bg-cover bg-right" />
            <div className="absolute inset-0 bg-[url('/ledt.svg')] bg-cover bg-left" />
          </div>
          <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              خطوات أمنة نحو
              <br />
              مستقبل آمن
            </h1>
            <p className="text-lg md:text-xl max-w-2xl text-balance leading-relaxed">
              قدمت شركة بي كير منذ الأزمان ولعدة عقود وإنجازات
              <br />
              تاريخية والقابلية العالية في الريادة والمجتمعات
            </p>
            <button onClick={redirectToStart} className="mt-8 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            ابدأ الآن
          </button>
          </div>
         
        </section>
  
        {/* About Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-[#1e5a7d] mb-3">عن بي كير</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto rounded-full" />
              </div>
  
              <div className="space-y-8 text-gray-700">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-lg leading-relaxed text-center">
                    تقدمت شركة بي كير منذ عام 2014 وحتى الآن بأفضل الخدمات التي تهدف إلى المساعدة في الحفاظ على الصحة
                    والوقاية من الأمراض وتحقيق أفضل مستوى من الرعاية الطبية والصحية
                  </p>
                </div>
  
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 border border-gray-200 rounded-lg">
                    <p className="leading-relaxed text-right">
                      تعتمد الشركة على خبراء ومتخصصين في المجال الطبي والصحي مع أحدث التقنيات والأساليب المبتكرة لتقديم
                      خدمات عالية الجودة تلبي احتياجات عملائنا في المجال الصحي وتوفر لهم أفضل مستوى من الرعاية
                    </p>
                  </div>
  
                  <div className="bg-white p-6 border border-gray-200 rounded-lg">
                    <p className="leading-relaxed text-right">
                      نسعى في بي كير لأن نكون الخيار الأمثل للأفراد والمؤسسات الباحثة عن حلول صحية شاملة ومتكاملة، ونعمل
                      جاهدين على تطوير خدماتنا بشكل مستمر لضمان تقديم أفضل النتائج والخدمات لعملائنا
                    </p>
                  </div>
                </div>
  
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <p className="leading-relaxed text-right">
                    مع بي كير، أنت في أيدٍ أمينة. نحن نؤمن بأن الصحة هي أغلى ما يملك الإنسان، ولذلك نعمل بكل جهدنا لتوفير
                    أفضل الحلول الصحية المبتكرة والمتطورة التي تساعد على الحفاظ على صحتك وصحة عائلتك
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Vision Section */}
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Mission Card */}
              <Card className="bg-white shadow-lg border-t-4 border-t-[#2c7ba5]">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1e5a7d] mb-4">رسالة الشركة</h3>
                      <p className="text-gray-700 leading-relaxed">رعاية صحية بجودة وشفافية من خلال خدمات ومنصات ذكية</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              {/* Vision Card */}
              <Card className="bg-white shadow-lg border-t-4 border-t-orange-400">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1e5a7d] mb-4">رؤيتنا</h3>
                      <p className="text-gray-700 leading-relaxed">
                        تقديم خدمة صحية متميزة للأفراد والمؤسسات والمساهمة في تطوير منظومة الصحية المتكاملة وتحقيق هدف أمة
                        الصحة للشركة
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              {/* Values Card */}
              <Card className="bg-white shadow-lg border-t-4 border-t-blue-600">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1e5a7d] mb-6">قيمنا</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-[#1e5a7d]" />
                          </div>
                          <p className="text-gray-700">الهوية والإبتكار</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Heart className="w-4 h-4 text-[#1e5a7d]" />
                          </div>
                          <p className="text-gray-700">ارتباط بالمجتمع والمسؤولية الاجتماعية</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-[#1e5a7d]" />
                          </div>
                          <p className="text-gray-700">الجودة والتميز</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-[#1e5a7d]" />
                          </div>
                          <p className="text-gray-700">الشفافية والمصداقية</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
  
        {/* Footer */}
        <footer className="bg-[#1e5a7d] text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#1e5a7d] font-bold text-sm">bCare</span>
                </div>
                <span className="text-3xl font-bold">bCare</span>
              </div>
  
              {/* Contact Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">تواصل معنا</h3>
                <a href="tel:920010050" className="text-3xl font-bold hover:text-blue-200 transition-colors">
                  920010050
                </a>
              </div>
  
              <div className="space-y-2 text-sm mb-8">
                <p>
                  <a href="mailto:info@bcare.com.sa" className="hover:text-blue-200 transition-colors">
                    info@bcare.com.sa
                  </a>
                </p>
                <p className="text-gray-300">طريق الملك عبدالله - الرياض - المملكة العربية السعودية</p>
                <p className="text-gray-300">المملكة العربية السعودية</p>
                <p className="text-gray-300">12345 الرياض</p>
              </div>
  
              {/* Footer Links */}
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-blue-200 transition-colors">
                  الشروط والأحكام
                </a>
                <a href="#" className="block hover:text-blue-200 transition-colors">
                  سياسة الخصوصية
                </a>
                <a href="#" className="block hover:text-blue-200 transition-colors">
                  قواعد ومنهج العمل
                </a>
                <a href="#" className="block hover:text-blue-200 transition-colors">
                  شروط وطرق الدفع
                </a>
              </div>
  
              {/* Copyright */}
              <div className="mt-8 pt-8 border-t border-blue-700">
                <p className="text-xs text-gray-300">جميع الحقوق محفوظة لشركة بي كير 2025©</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  }
  