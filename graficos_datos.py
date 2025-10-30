import io
import xlsxwriter

def generar_excel(datos):
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})

    # ======= FORMATOS GLOBALES =======
    azul_principal = '#1F4E79'
    celeste = '#B8CCE4'
    gris = '#F2F2F2'

    titulo = workbook.add_format({
        'bold': True, 'font_size': 18, 'align': 'center',
        'font_color': azul_principal
    })
    subtitulo = workbook.add_format({
        'bold': True, 'font_size': 14, 'align': 'center',
        'font_color': '#2E75B6'
    })
    header = workbook.add_format({
        'bold': True, 'bg_color': celeste, 'border': 1,
        'align': 'center', 'font_color': azul_principal
    })
    celda = workbook.add_format({'border': 1, 'align': 'center'})
    num = workbook.add_format({'num_format': '0.00', 'border': 1, 'align': 'center'})
    resumen = workbook.add_format({'bold': True, 'font_color': azul_principal, 'align': 'center'})
    fondo_resumen = workbook.add_format({'bg_color': gris, 'align': 'center', 'border': 1})

    # ======= HOJA 1: RESULTADOS =======
    ws = workbook.add_worksheet("Resultados")
    ws.set_column('A:A', 15)
    ws.set_column('B:H', 20)

    ws.merge_range('A1:H1', 'Informe de Colisión Elástica - Simulación de Carritos', titulo)
    ws.merge_range('A2:H2', 'Resultados generales de las magnitudes físicas medidas', subtitulo)

    headers = [
        'Carrito', 'Masa (kg)', 'Velocidad Inicial (m/s)', 'Velocidad Final (m/s)',
        'Energía Cinética Inicial (J)', 'Energía Cinética Final (J)',
        'Momento Inicial (kg·m/s)', 'Momento Final (kg·m/s)'
    ]
    ws.write_row('A4', headers, header)

    fila = 4
    total_ek_i = total_ek_f = total_p_i = total_p_f = 0
    velocidades_iniciales, velocidades_finales = [], []
    energias_i, energias_f = [], []
    momentos_i, momentos_f = [], []

    for d in datos:
        m = d['masa']
        vi = d['vel_inicial']
        vf = d['vel_final']
        ek_i = 0.5 * m * vi ** 2
        ek_f = 0.5 * m * vf ** 2
        p_i = m * vi
        p_f = m * vf

        total_ek_i += ek_i
        total_ek_f += ek_f
        total_p_i += p_i
        total_p_f += p_f

        velocidades_iniciales.append(vi)
        velocidades_finales.append(vf)
        energias_i.append(ek_i)
        energias_f.append(ek_f)
        momentos_i.append(p_i)
        momentos_f.append(p_f)

        ws.write(fila, 0, d['carrito'], celda)
        ws.write_number(fila, 1, m, num)
        ws.write_number(fila, 2, vi, num)
        ws.write_number(fila, 3, vf, num)
        ws.write_number(fila, 4, ek_i, num)
        ws.write_number(fila, 5, ek_f, num)
        ws.write_number(fila, 6, p_i, num)
        ws.write_number(fila, 7, p_f, num)
        fila += 1

    # ======= GRÁFICOS COMPARATIVOS =======
    def grafico_lineal(ws, celda, col1, col2, n1, n2, titulo, eje_y):
        chart = workbook.add_chart({'type': 'line'})
        chart.add_series({
            'name': n1,
            'categories': ['Resultados', 5, 0, fila - 1, 0],
            'values': ['Resultados', 5, col1, fila - 1, col1],
            'line': {'color': '#36A2EB', 'width': 2},
            'marker': {'type': 'circle', 'size': 6, 'fill': {'color': '#36A2EB'}}
        })
        chart.add_series({
            'name': n2,
            'categories': ['Resultados', 5, 0, fila - 1, 0],
            'values': ['Resultados', 5, col2, fila - 1, col2],
            'line': {'color': '#FF6384', 'width': 2},
            'marker': {'type': 'square', 'size': 6, 'fill': {'color': '#FF6384'}}
        })
        chart.set_title({'name': titulo})
        chart.set_x_axis({'name': 'Carrito', 'label_position': 'low'})
        chart.set_y_axis({'name': eje_y, 'major_gridlines': {'visible': True}})
        chart.set_legend({'position': 'top'})
        chart.set_style(13)
        ws.insert_chart(celda, chart, {'x_offset': 25, 'y_offset': 10})

    grafico_lineal(ws, 'A8', 2, 3, 'Velocidad Inicial', 'Velocidad Final', 'Comparativa de Velocidades (m/s)', 'Velocidad (m/s)')
    grafico_lineal(ws, 'I8', 4, 5, 'Energía Cinética Inicial', 'Energía Cinética Final', 'Comparativa de Energías Cinéticas', 'Energía (J)')
    grafico_lineal(ws, 'A24', 6, 7, 'Momento Inicial', 'Momento Final', 'Comparativa de Momento Lineal', 'Momento (kg·m/s)')

    # ======= HOJA 2: CONSERVACIÓN =======
    ws2 = workbook.add_worksheet("Conservación")
    ws2.set_column('A:A', 30)
    ws2.set_column('B:B', 25)

    ws2.merge_range('A1:B1', 'Análisis de Conservación', titulo)
    ws2.write('A3', 'Magnitud', header)
    ws2.write('B3', 'Porcentaje Conservado (%)', header)

    porcentaje_ek = (total_ek_f / total_ek_i * 100) if total_ek_i != 0 else 0
    porcentaje_p = (total_p_f / total_p_i * 100) if total_p_i != 0 else 0

    ws2.write('A4', 'Energía Cinética', celda)
    ws2.write_number('B4', porcentaje_ek, num)
    ws2.write('A5', 'Momento Lineal', celda)
    ws2.write_number('B5', porcentaje_p, num)

    # Gráfico de barras comparativo (más visual)
    chart = workbook.add_chart({'type': 'column'})
    chart.add_series({
        'name': 'Porcentaje Conservado',
        'categories': ['Conservación', 4, 0, 5, 0],
        'values': ['Conservación', 4, 1, 5, 1],
        'fill': {'color': '#4BC0C0'}
    })
    chart.set_title({'name': 'Conservación de Magnitudes Físicas'})
    chart.set_y_axis({'name': 'Porcentaje (%)', 'min': 0, 'max': 120})
    chart.set_style(11)
    ws2.insert_chart('D3', chart, {'x_offset': 25, 'y_offset': 10})

    # Resumen textual final
    ws2.merge_range('A8:B8', 'Resumen General', resumen)
    ws2.write('A9', 'Energía Conservada ≈', fondo_resumen)
    ws2.write('B9', f"{porcentaje_ek:.2f} %", celda)
    ws2.write('A10', 'Momento Conservado ≈', fondo_resumen)
    ws2.write('B10', f"{porcentaje_p:.2f} %", celda)

    # ======= HOJA 3: DISTRIBUCIONES =======
    ws3 = workbook.add_worksheet("Distribuciones")
    ws3.merge_range('A1:H1', 'Distribución de Magnitudes Físicas', titulo)

    def histograma(hoja, celda, datos, nombre, color):
        start_row = 3
        for i, val in enumerate(datos):
            hoja.write_number(start_row + i, 0, val, num)

        chart = workbook.add_chart({'type': 'line'})
        chart.add_series({
            'name': nombre,
            'categories': [hoja.get_name(), start_row, 0, start_row + len(datos) - 1, 0],
            'values': [hoja.get_name(), start_row, 0, start_row + len(datos) - 1, 0],
            'line': {'color': color, 'width': 2},
            'marker': {'type': 'circle', 'size': 5, 'fill': {'color': color}}
        })
        chart.set_title({'name': f'Distribución de {nombre}'})
        chart.set_x_axis({'name': nombre})
        chart.set_y_axis({'name': 'Frecuencia estimada'})
        chart.set_style(12)
        hoja.insert_chart(celda, chart, {'x_offset': 20, 'y_offset': 10})

    histograma(ws3, 'C2', velocidades_iniciales, 'Velocidad Inicial (m/s)', '#36A2EB')
    histograma(ws3, 'C18', energias_i, 'Energía Cinética Inicial (J)', '#FFCE56')
    histograma(ws3, 'C34', momentos_i, 'Momento Lineal Inicial (kg·m/s)', '#4BC0C0')

    # ======= FINAL =======
    workbook.close()
    output.seek(0)
    return output
