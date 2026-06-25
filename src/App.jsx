* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #FAEEDA;
  color: #2C2C2A;
  -webkit-font-smoothing: antialiased;
}

.app {
  max-width: 520px;
  margin: 0 auto;
  padding: 22px 16px 90px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 22px;
  text-align: center;
  color: #854F0B;
}

.section-label {
  font-size: 13px;
  color: #854F0B;
  margin: 0 0 8px 2px;
}

.quick-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.quick-btn {
  background: #fff;
  border: 1px solid #EF9F27;
  border-radius: 22px;
  padding: 11px 17px;
  font-size: 16px;
  cursor: pointer;
  color: #633806;
}

.quick-btn:active {
  background: #FAEEDA;
}

.settings-btn {
  background: none;
  border: none;
  color: #854F0B;
  font-size: 22px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}

.add-row {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.add-row input,
.add-row select {
  font-size: 16px;
  padding: 13px 12px;
  border: 1px solid #E1D9C8;
  border-radius: 12px;
  background: #fff;
  color: #2C2C2A;
}

.add-row input {
  flex: 1;
  min-width: 0;
}

.add-row select {
  width: 120px;
}

.add-btn {
  background: #BA7517;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0 20px;
  font-size: 24px;
  cursor: pointer;
  min-width: 56px;
}

.cat-section {
  margin-bottom: 22px;
}

.cat-header {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px 2px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.cat-icon {
  font-size: 20px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 8px;
}

.check {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  border: 1.5px solid #D3D1C7;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
}

.check.done {
  background: #1D9E75;
  border-color: #1D9E75;
}

.item-name {
  flex: 1;
  font-size: 17px;
}

.item-name.done {
  text-decoration: line-through;
  color: #B4B2A9;
}

.qty-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid #E1D9C8;
  background: #fff;
  font-size: 22px;
  cursor: pointer;
  color: #854F0B;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-num {
  font-size: 15px;
  color: #888780;
  min-width: 28px;
  text-align: center;
}

.del-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #D3D1C7;
  padding: 4px;
}

.empty, .loading {
  text-align: center;
  color: #B4B2A9;
  padding: 40px 0;
  font-size: 16px;
}

.clear-done {
  display: block;
  margin: 18px auto 0;
  background: #fff;
  border: 1px solid #E1D9C8;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 15px;
  color: #854F0B;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: #FAEEDA;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 22px 18px 32px;
}

.modal h2 {
  font-size: 19px;
  font-weight: 600;
  color: #854F0B;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-close {
  background: none;
  border: none;
  font-size: 26px;
  color: #888780;
  cursor: pointer;
  line-height: 1;
}

.fav-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
}

.fav-name {
  flex: 1;
  font-size: 16px;
}

.fav-cat {
  font-size: 13px;
  color: #888780;
}
