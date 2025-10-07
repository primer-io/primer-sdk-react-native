package com.example

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity

class DeeplinkReturnActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.i(DeeplinkReturnActivity::class.simpleName, "Starting MainActivity")
    val intent = Intent(this, MainActivity::class.java)
    startActivity(intent)
    finish()
  }
}
