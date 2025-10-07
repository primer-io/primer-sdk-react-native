-dontnote kotlinx.serialization.AnnotationsKt # core serialization annotations

-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.primerioreactnative.**$$serializer { *; }
-keepclasseswithmembers class com.primerioreactnative.** {
    kotlinx.serialization.KSerializer serializer(...);
}
